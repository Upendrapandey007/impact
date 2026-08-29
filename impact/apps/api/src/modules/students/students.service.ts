import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, ilike } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import type { AuthUser } from '../../common/decorators/index';
import { DATABASE_TOKEN } from '../../providers/database.module';

@Injectable()
export class StudentsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Get the authenticated student's full profile (including academic, aid, SAP).
   */
  async getMyProfile(actor: AuthUser) {
    const student = await this.db.query.students.findFirst({
      where: and(
        eq(schema.students.userId, actor.id),
        eq(schema.students.institutionId, actor.institutionId),
      ),
      with: {
        program: true,
        user: true,
        advisor: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found for the current user');
    }

    return this.hydrateStudentProfile(student.id, actor.institutionId, student);
  }

  /**
   * Get a specific student's profile (advisor / staff view).
   */
  async getStudentById(studentId: string, actor: AuthUser) {
    const student = await this.db.query.students.findFirst({
      where: and(
        eq(schema.students.id, studentId),
        eq(schema.students.institutionId, actor.institutionId),
      ),
      with: {
        program: true,
        user: true,
        advisor: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    return this.hydrateStudentProfile(studentId, actor.institutionId, student);
  }

  /**
   * List students with filtering and pagination (Advisor/Admin view).
   */
  async listStudents(
    actor: AuthUser,
    options: {
      query?: string;
      programCode?: string;
      level?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const students = await this.db.query.students.findMany({
      where: eq(schema.students.institutionId, actor.institutionId),
      with: {
        program: true,
        user: true,
        advisor: true,
      },
      limit,
      offset,
      orderBy: [desc(schema.students.createdAt)],
    });

    return {
      data: students,
      page,
      limit,
    };
  }

  /**
   * Get student's current & historical enrollments.
   */
  async getEnrollments(studentId: string, actor: AuthUser) {
    await this.verifyStudentBelongsToTenant(studentId, actor.institutionId);

    const currentTerm = await this.getCurrentTerm(actor.institutionId);

    const enrollments = await this.db.query.enrollments.findMany({
      where: and(
        eq(schema.enrollments.studentId, studentId),
        eq(schema.enrollments.institutionId, actor.institutionId),
      ),
      with: {
        course: true,
        term: true,
      },
      orderBy: [desc(schema.enrollments.createdAt)],
    });

    const currentEnrollments = enrollments.filter(
      (e) => currentTerm && e.termId === currentTerm.id,
    );

    const totalCurrentCredits = currentEnrollments
      .filter((e) => e.status === 'enrolled')
      .reduce((sum, e) => sum + parseFloat(e.course.credits), 0);

    return {
      currentTerm,
      currentEnrollments,
      totalCurrentCredits,
      allEnrollments: enrollments,
    };
  }

  /**
   * Get student's financial aid awards and scholarship breakdown.
   */
  async getFinancialAid(studentId: string, actor: AuthUser) {
    await this.verifyStudentBelongsToTenant(studentId, actor.institutionId);

    const awards = await this.db.query.financialAidAwards.findMany({
      where: and(
        eq(schema.financialAidAwards.studentId, studentId),
        eq(schema.financialAidAwards.institutionId, actor.institutionId),
      ),
      with: {
        term: true,
      },
      orderBy: [desc(schema.financialAidAwards.createdAt)],
    });

    const totalAwardAmount = awards
      .filter((a) => a.status === 'accepted' || a.status === 'disbursed')
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);

    return {
      awards,
      totalAwardAmount,
    };
  }

  /**
   * Get student's SAP compliance history.
   */
  async getSapHistory(studentId: string, actor: AuthUser) {
    await this.verifyStudentBelongsToTenant(studentId, actor.institutionId);

    const records = await this.db.query.sapRecords.findMany({
      where: and(
        eq(schema.sapRecords.studentId, studentId),
        eq(schema.sapRecords.institutionId, actor.institutionId),
      ),
      with: {
        term: true,
      },
      orderBy: [desc(schema.sapRecords.evaluatedAt)],
    });

    const latest = records[0] ?? null;

    return {
      currentSapStatus: latest?.status ?? 'satisfactory',
      latestRecord: latest,
      history: records,
    };
  }

  // ─── Internal Helpers ───────────────────────────────────────────────────────

  private async hydrateStudentProfile(
    studentId: string,
    institutionId: string,
    student: any,
  ) {
    const currentTerm = await this.getCurrentTerm(institutionId);

    let academicRecord = null;
    if (currentTerm) {
      academicRecord = await this.db.query.academicRecords.findFirst({
        where: and(
          eq(schema.academicRecords.studentId, studentId),
          eq(schema.academicRecords.termId, currentTerm.id),
        ),
      });
    }

    const { totalCurrentCredits, currentEnrollments } = await this.getEnrollments(
      studentId,
      { institutionId } as AuthUser,
    );

    const { awards, totalAwardAmount } = await this.getFinancialAid(
      studentId,
      { institutionId } as AuthUser,
    );

    const { currentSapStatus, latestRecord } = await this.getSapHistory(
      studentId,
      { institutionId } as AuthUser,
    );

    return {
      id: student.id,
      studentNumber: student.studentNumber,
      name: student.user?.name ?? 'Unknown Student',
      email: student.user?.email ?? '',
      level: student.level,
      enrollmentStatus: student.enrollmentStatus,
      expectedGraduation: student.expectedGraduation,
      program: student.program
        ? {
            id: student.program.id,
            code: student.program.code,
            name: student.program.name,
            degreeType: student.program.degreeType,
            totalCredits: student.program.totalCredits,
          }
        : null,
      advisor: student.advisor
        ? {
            id: student.advisor.id,
            name: student.advisor.name,
            email: student.advisor.email,
          }
        : null,
      academicSummary: {
        cumulativeGpa: academicRecord ? parseFloat(academicRecord.cumulativeGpa ?? '0') : 0,
        termGpa: academicRecord ? parseFloat(academicRecord.termGpa ?? '0') : 0,
        creditsEnrolled: totalCurrentCredits,
        creditsCompleted: academicRecord ? parseFloat(academicRecord.creditsEarned ?? '0') : 0,
        creditsRequired: student.program?.totalCredits ?? 120,
        standing: academicRecord?.standing ?? 'good',
      },
      financialAidSummary: {
        totalAidAmount: totalAwardAmount,
        activeAwardsCount: awards.length,
        currentTermAwards: awards,
      },
      sapSummary: {
        status: currentSapStatus,
        paceRate: latestRecord ? parseFloat(latestRecord.paceRate ?? '1') : 1,
        maxTimeframePct: latestRecord ? parseFloat(latestRecord.maxTimeframePct ?? '0') : 0,
      },
      currentEnrollments: currentEnrollments.map((e) => ({
        id: e.id,
        courseCode: e.course.code,
        courseTitle: e.course.title,
        credits: parseFloat(e.course.credits),
        status: e.status,
      })),
    };
  }

  private async getCurrentTerm(institutionId: string) {
    return this.db.query.terms.findFirst({
      where: and(
        eq(schema.terms.institutionId, institutionId),
        eq(schema.terms.isCurrent, true),
      ),
    });
  }

  private async verifyStudentBelongsToTenant(studentId: string, institutionId: string) {
    const student = await this.db.query.students.findFirst({
      where: and(
        eq(schema.students.id, studentId),
        eq(schema.students.institutionId, institutionId),
      ),
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    return student;
  }
}
