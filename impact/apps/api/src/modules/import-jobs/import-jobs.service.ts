import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import type { AuthUser } from '../../common/decorators/index';
import { DATABASE_TOKEN } from '../../providers/database.module';
import type { CreateImportJobDto, CsvImportType } from './dto/create-import.dto';

export interface RowError {
  row: number;
  field?: string;
  message: string;
  data: Record<string, string>;
}

@Injectable()
export class ImportJobsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Creates an import job and processes CSV content synchronously/inline for MVP.
   */
  async createAndProcessJob(dto: CreateImportJobDto, actor: AuthUser) {
    const institutionId = actor.institutionId;

    // 1. Create initial job record in queued/processing state
    const [job] = await this.db
      .insert(schema.importJobs)
      .values({
        institutionId,
        type: dto.type,
        fileUrl: dto.fileName ?? `${dto.type}_import_${Date.now()}.csv`,
        status: 'processing',
        totalRecords: 0,
        processedRecords: 0,
        errorRecords: 0,
        errors: [],
        startedAt: new Date(),
        createdBy: actor.id,
      })
      .returning();

    if (!job) throw new Error('Failed to create import job record');

    try {
      // 2. Parse CSV into records
      const { rows, headers } = this.parseCsv(dto.csvContent);

      if (rows.length === 0) {
        await this.db
          .update(schema.importJobs)
          .set({
            status: 'failed',
            totalRecords: 0,
            errors: [{ row: 0, message: 'CSV file is empty or missing headers', data: {} }],
            completedAt: new Date(),
          })
          .where(eq(schema.importJobs.id, job.id));

        return this.getJob(job.id, actor);
      }

      // 3. Process according to type
      const errors: RowError[] = [];
      let processed = 0;

      switch (dto.type) {
        case 'courses':
          ({ processed } = await this.importCourses(institutionId, rows, errors));
          break;
        case 'programs':
          ({ processed } = await this.importPrograms(institutionId, rows, errors));
          break;
        case 'students':
          ({ processed } = await this.importStudents(institutionId, rows, errors));
          break;
        case 'enrollments':
          ({ processed } = await this.importEnrollments(institutionId, rows, errors));
          break;
        case 'financial_aid':
          ({ processed } = await this.importFinancialAid(institutionId, rows, errors));
          break;
      }

      const status =
        errors.length === 0
          ? 'completed'
          : processed > 0
            ? 'partial'
            : 'failed';

      // 4. Update job with completion results
      await this.db
        .update(schema.importJobs)
        .set({
          status,
          totalRecords: rows.length,
          processedRecords: processed,
          errorRecords: errors.length,
          errors: errors as unknown as Record<string, unknown>[],
          completedAt: new Date(),
        })
        .where(eq(schema.importJobs.id, job.id));

      return this.getJob(job.id, actor);
    } catch (err) {
      await this.db
        .update(schema.importJobs)
        .set({
          status: 'failed',
          errors: [
            {
              row: 0,
              message: err instanceof Error ? err.message : 'Fatal parsing error',
              data: {},
            },
          ],
          completedAt: new Date(),
        })
        .where(eq(schema.importJobs.id, job.id));

      throw err;
    }
  }

  /**
   * Get details of a specific import job.
   */
  async getJob(jobId: string, actor: AuthUser) {
    const job = await this.db.query.importJobs.findFirst({
      where: and(
        eq(schema.importJobs.id, jobId),
        eq(schema.importJobs.institutionId, actor.institutionId),
      ),
    });

    if (!job) {
      throw new NotFoundException(`Import job ${jobId} not found`);
    }

    return job;
  }

  /**
   * List recent import jobs for the institution.
   */
  async listJobs(actor: AuthUser, limit = 20, offset = 0) {
    return this.db.query.importJobs.findMany({
      where: eq(schema.importJobs.institutionId, actor.institutionId),
      orderBy: [desc(schema.importJobs.createdAt)],
      limit,
      offset,
    });
  }

  // ─── CSV Parser Helper ───────────────────────────────────────────────────────

  private parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = this.parseCsvLine(lines[0]!).map((h) => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]!);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index]!.trim() : '';
      });
      rows.push(row);
    }

    return { headers, rows };
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  // ─── Entity Importers ───────────────────────────────────────────────────────

  private async importCourses(
    institutionId: string,
    rows: Record<string, string>[],
    errors: RowError[],
  ) {
    let processed = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2; // 1-indexed including header

      const code = row['code'] ?? row['courseCode'];
      const title = row['title'] ?? row['courseTitle'];
      const credits = row['credits'];
      const department = row['department'] ?? 'General';

      if (!code || !title || !credits) {
        errors.push({
          row: rowNum,
          message: 'Missing required course fields (code, title, credits)',
          data: row,
        });
        continue;
      }

      const numCredits = parseFloat(credits);
      if (isNaN(numCredits) || numCredits <= 0) {
        errors.push({
          row: rowNum,
          field: 'credits',
          message: 'Credits must be a positive number',
          data: row,
        });
        continue;
      }

      try {
        await this.db
          .insert(schema.courses)
          .values({
            institutionId,
            code: code.trim(),
            title: title.trim(),
            credits: numCredits.toFixed(2),
            department: department.trim(),
            isActive: true,
          })
          .onConflictDoUpdate({
            target: [schema.courses.institutionId, schema.courses.code],
            set: {
              title: title.trim(),
              credits: numCredits.toFixed(2),
              department: department.trim(),
            },
          });
        processed++;
      } catch (err) {
        errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Database insertion error',
          data: row,
        });
      }
    }
    return { processed };
  }

  private async importPrograms(
    institutionId: string,
    rows: Record<string, string>[],
    errors: RowError[],
  ) {
    let processed = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2;

      const code = row['code'] ?? row['programCode'];
      const name = row['name'] ?? row['programName'];
      const degreeType = row['degreeType'] ?? 'BS';
      const totalCredits = row['totalCredits'] ? parseInt(row['totalCredits']) : 120;

      if (!code || !name) {
        errors.push({
          row: rowNum,
          message: 'Missing required program fields (code, name)',
          data: row,
        });
        continue;
      }

      try {
        await this.db
          .insert(schema.programs)
          .values({
            institutionId,
            code: code.trim(),
            name: name.trim(),
            degreeType: degreeType.trim(),
            totalCredits,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: [schema.programs.institutionId, schema.programs.code],
            set: { name: name.trim(), degreeType: degreeType.trim(), totalCredits },
          });
        processed++;
      } catch (err) {
        errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Database error',
          data: row,
        });
      }
    }
    return { processed };
  }

  private async importStudents(
    institutionId: string,
    rows: Record<string, string>[],
    errors: RowError[],
  ) {
    let processed = 0;

    // Load available programs for mapping
    const programsList = await this.db.query.programs.findMany({
      where: eq(schema.programs.institutionId, institutionId),
    });
    const progMap = new Map(programsList.map((p) => [p.code.toUpperCase(), p.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2;

      const studentNumber = row['studentNumber'] ?? row['id'];
      const name = row['name'] ?? row['fullName'];
      const email = row['email'];
      const programCode = (row['programCode'] ?? row['major'] ?? '').toUpperCase();
      const level = (row['level'] ?? 'freshman').toLowerCase();
      const expectedGraduation = row['expectedGraduation'] ?? '2028-05-15';

      if (!studentNumber || !name || !email) {
        errors.push({
          row: rowNum,
          message: 'Missing required student fields (studentNumber, name, email)',
          data: row,
        });
        continue;
      }

      const programId = programCode ? progMap.get(programCode) ?? null : null;

      try {
        // Create user record if not exists
        let user = await this.db.query.users.findFirst({
          where: and(
            eq(schema.users.institutionId, institutionId),
            eq(schema.users.email, email.trim()),
          ),
        });

        if (!user) {
          const [newUser] = await this.db
            .insert(schema.users)
            .values({
              institutionId,
              email: email.trim(),
              name: name.trim(),
              role: 'student',
              isActive: true,
            })
            .returning();
          user = newUser;
        }

        if (!user) throw new Error('Failed to resolve user account');

        // Upsert student record
        await this.db
          .insert(schema.students)
          .values({
            institutionId,
            userId: user.id,
            studentNumber: studentNumber.trim(),
            programId,
            level: level as 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate',
            enrollmentStatus: 'full_time',
            expectedGraduation,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: [schema.students.institutionId, schema.students.studentNumber],
            set: {
              programId: programId ?? undefined,
              level: level as 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate',
              expectedGraduation,
            },
          });

        processed++;
      } catch (err) {
        errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Database error',
          data: row,
        });
      }
    }
    return { processed };
  }

  private async importEnrollments(
    institutionId: string,
    rows: Record<string, string>[],
    errors: RowError[],
  ) {
    let processed = 0;

    // Preload lookup maps
    const studentsList = await this.db.query.students.findMany({
      where: eq(schema.students.institutionId, institutionId),
    });
    const stuMap = new Map(studentsList.map((s) => [s.studentNumber, s.id]));

    const coursesList = await this.db.query.courses.findMany({
      where: eq(schema.courses.institutionId, institutionId),
    });
    const courseMap = new Map(coursesList.map((c) => [c.code.toUpperCase(), c]));

    const termsList = await this.db.query.terms.findMany({
      where: eq(schema.terms.institutionId, institutionId),
    });
    const termMap = new Map(termsList.map((t) => [t.code.toUpperCase(), t.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2;

      const studentNumber = row['studentNumber'];
      const courseCode = (row['courseCode'] ?? '').toUpperCase();
      const termCode = (row['termCode'] ?? '').toUpperCase();
      const status = (row['status'] ?? 'enrolled').toLowerCase();

      if (!studentNumber || !courseCode || !termCode) {
        errors.push({
          row: rowNum,
          message: 'Missing studentNumber, courseCode, or termCode',
          data: row,
        });
        continue;
      }

      const studentId = stuMap.get(studentNumber);
      if (!studentId) {
        errors.push({
          row: rowNum,
          field: 'studentNumber',
          message: `Student '${studentNumber}' does not exist`,
          data: row,
        });
        continue;
      }

      const course = courseMap.get(courseCode);
      if (!course) {
        errors.push({
          row: rowNum,
          field: 'courseCode',
          message: `Course '${courseCode}' does not exist`,
          data: row,
        });
        continue;
      }

      const termId = termMap.get(termCode);
      if (!termId) {
        errors.push({
          row: rowNum,
          field: 'termCode',
          message: `Term '${termCode}' does not exist`,
          data: row,
        });
        continue;
      }

      try {
        await this.db.insert(schema.enrollments).values({
          institutionId,
          studentId,
          courseId: course.id,
          termId,
          status: status as 'enrolled' | 'dropped' | 'withdrawn' | 'completed' | 'failed',
          creditsAttempted: course.credits,
          creditsEarned: status === 'completed' ? course.credits : '0.00',
        });
        processed++;
      } catch (err) {
        errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Database insertion error',
          data: row,
        });
      }
    }
    return { processed };
  }

  private async importFinancialAid(
    institutionId: string,
    rows: Record<string, string>[],
    errors: RowError[],
  ) {
    let processed = 0;

    const studentsList = await this.db.query.students.findMany({
      where: eq(schema.students.institutionId, institutionId),
    });
    const stuMap = new Map(studentsList.map((s) => [s.studentNumber, s.id]));

    const termsList = await this.db.query.terms.findMany({
      where: eq(schema.terms.institutionId, institutionId),
    });
    const termMap = new Map(termsList.map((t) => [t.code.toUpperCase(), t.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2;

      const studentNumber = row['studentNumber'];
      const termCode = (row['termCode'] ?? '').toUpperCase();
      const aidType = (row['aidType'] ?? 'GRANT').toUpperCase();
      const name = row['name'] ?? `${aidType} Award`;
      const amount = parseFloat(row['amount'] ?? '0');
      const status = (row['status'] ?? 'accepted').toLowerCase();

      if (!studentNumber || !termCode || isNaN(amount) || amount <= 0) {
        errors.push({
          row: rowNum,
          message: 'Invalid financial aid row (requires valid studentNumber, termCode, and positive amount)',
          data: row,
        });
        continue;
      }

      const studentId = stuMap.get(studentNumber);
      if (!studentId) {
        errors.push({
          row: rowNum,
          field: 'studentNumber',
          message: `Student '${studentNumber}' does not exist`,
          data: row,
        });
        continue;
      }

      const termId = termMap.get(termCode);
      if (!termId) {
        errors.push({
          row: rowNum,
          field: 'termCode',
          message: `Term '${termCode}' does not exist`,
          data: row,
        });
        continue;
      }

      try {
        await this.db.insert(schema.financialAidAwards).values({
          institutionId,
          studentId,
          termId,
          aidType: aidType as 'PELL' | 'LOAN_SUB' | 'LOAN_UNSUB' | 'SCHOLARSHIP' | 'GRANT' | 'WORK_STUDY',
          name,
          amount: amount.toFixed(2),
          status: status as 'offered' | 'accepted' | 'disbursed' | 'cancelled' | 'reduced',
          conditions: [],
        });
        processed++;
      } catch (err) {
        errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Database insertion error',
          data: row,
        });
      }
    }
    return { processed };
  }
}
