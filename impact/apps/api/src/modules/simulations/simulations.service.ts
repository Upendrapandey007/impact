import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import { RuleEngine } from '@impact/rules';
import type { RuleDefinition } from '@impact/rules';
import type { StudentState } from '@impact/types';
import { eq, and } from 'drizzle-orm';

import { DATABASE_TOKEN } from '../../providers/database.module';
import { SIMULATION_QUEUE } from '../../providers/queue.module';
import type { CreateSimulationDto } from './dto/create-simulation.dto';
import type { AuthUser } from '../../common/decorators/index';

const SIMULATION_DISCLAIMER =
  'This simulation is informational only and does not constitute an official financial-aid determination. Final eligibility is determined by your institution.';

@Injectable()
export class SimulationsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    @InjectQueue(SIMULATION_QUEUE) private readonly simulationQueue: Queue,
  ) {}

  /**
   * Creates a simulation job and queues it for async processing.
   * Returns immediately with the simulation ID + pending status.
   */
  async createSimulation(
    dto: CreateSimulationDto,
    actor: AuthUser,
  ): Promise<{ simulationId: string; status: 'pending'; estimatedMs: number }> {
    const institutionId = actor.institutionId;

    // Resolve student ID
    const studentId = await this.resolveStudentId(dto, actor, institutionId);

    // Build current student state snapshot
    const studentState = await this.buildStudentState(studentId, institutionId);

    // Build hypothetical state via ScenarioBuilder
    // (done in the worker, not here — just capture parameters)

    // Insert scenario record
    const [scenario] = await this.db
      .insert(schema.scenarios)
      .values({
        institutionId,
        studentId,
        initiatedBy: actor.id,
        type: dto.type,
        parameters: dto.parameters,
        currentState: studentState as unknown as Record<string, unknown>,
        hypotheticalState: {}, // filled by worker
      })
      .returning({ id: schema.scenarios.id });

    if (!scenario) throw new Error('Failed to create scenario');

    // Insert simulation record (pending)
    const [simulation] = await this.db
      .insert(schema.simulations)
      .values({
        institutionId,
        studentId,
        scenarioId: scenario.id,
        status: 'pending',
        riskScores: {},
        policyVersionIds: [],
        ruleIds: [],
      })
      .returning({ id: schema.simulations.id });

    if (!simulation) throw new Error('Failed to create simulation');

    // Enqueue for processing
    await this.simulationQueue.add(
      'process-simulation',
      {
        simulationId: simulation.id,
        scenarioId: scenario.id,
        institutionId,
        studentId,
        scenarioType: dto.type,
        parameters: dto.parameters,
        studentState,
      },
      { priority: 1 },
    );

    return {
      simulationId: simulation.id,
      status: 'pending',
      estimatedMs: 1500,
    };
  }

  /**
   * Retrieves a completed simulation with full impact detail.
   */
  async getSimulation(
    simulationId: string,
    actor: AuthUser,
  ) {
    const sim = await this.db.query.simulations.findFirst({
      where: and(
        eq(schema.simulations.id, simulationId),
        eq(schema.simulations.institutionId, actor.institutionId),
      ),
      with: {
        scenario: true,
        impacts: {
          with: {
            rule: true,
            policyVersion: true,
          },
        },
      },
    });

    if (!sim) {
      throw new NotFoundException(`Simulation ${simulationId} not found`);
    }

    return {
      ...sim,
      disclaimer: SIMULATION_DISCLAIMER,
    };
  }

  /**
   * Lists simulations for a student.
   */
  async listSimulations(studentId: string, actor: AuthUser, limit = 20, offset = 0) {
    const rows = await this.db.query.simulations.findMany({
      where: and(
        eq(schema.simulations.studentId, studentId),
        eq(schema.simulations.institutionId, actor.institutionId),
      ),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit,
      offset,
      with: { scenario: true },
    });

    return rows;
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async resolveStudentId(
    dto: CreateSimulationDto,
    actor: AuthUser,
    institutionId: string,
  ): Promise<string> {
    if (actor.role === 'student') {
      // Students can only simulate for themselves
      const student = await this.db.query.students.findFirst({
        where: and(
          eq(schema.students.userId, actor.id),
          eq(schema.students.institutionId, institutionId),
        ),
      });
      if (!student) throw new NotFoundException('Student record not found');
      return student.id;
    }

    if (!dto.studentId) {
      throw new Error('studentId is required for advisor/admin simulations');
    }

    return dto.studentId;
  }

  /**
   * Builds a canonical StudentState from the database.
   * This is what gets evaluated by the rule engine.
   */
  async buildStudentState(studentId: string, institutionId: string): Promise<StudentState> {
    const student = await this.db.query.students.findFirst({
      where: and(
        eq(schema.students.id, studentId),
        eq(schema.students.institutionId, institutionId),
      ),
      with: {
        program: true,
        user: true,
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    // Get current term
    const currentTerm = await this.db.query.terms.findFirst({
      where: and(
        eq(schema.terms.institutionId, institutionId),
        eq(schema.terms.isCurrent, true),
      ),
    });

    if (!currentTerm) throw new Error('No current term configured');

    // Get academic record for current term
    const academicRecord = await this.db.query.academicRecords.findFirst({
      where: and(
        eq(schema.academicRecords.studentId, studentId),
        eq(schema.academicRecords.termId, currentTerm.id),
      ),
    });

    // Get current term enrollments
    const enrollments = await this.db.query.enrollments.findMany({
      where: and(
        eq(schema.enrollments.studentId, studentId),
        eq(schema.enrollments.termId, currentTerm.id),
      ),
      with: { course: true },
    });

    // Get current term financial aid
    const aidAwards = await this.db.query.financialAidAwards.findMany({
      where: and(
        eq(schema.financialAidAwards.studentId, studentId),
        eq(schema.financialAidAwards.termId, currentTerm.id),
      ),
    });

    // Get scholarships
    const scholarships = await this.db.query.scholarships.findMany({
      where: eq(schema.scholarships.institutionId, institutionId),
    });

    // Get SAP record
    const sapRecord = await this.db.query.sapRecords.findFirst({
      where: and(
        eq(schema.sapRecords.studentId, studentId),
        eq(schema.sapRecords.termId, currentTerm.id),
      ),
    });

    const creditsEnrolled = enrollments
      .filter((e) => e.status === 'enrolled')
      .reduce((sum, e) => sum + Number(e.course.credits), 0);

    const totalAidAmount = aidAwards
      .filter((a) => a.status === 'accepted' || a.status === 'disbursed')
      .reduce((sum, a) => sum + Number(a.amount), 0);

    return {
      studentId,
      institutionId,
      termId: currentTerm.id,
      termCode: currentTerm.code,

      creditsEnrolled,
      creditsCompleted: Number(academicRecord?.creditsEarned ?? 0),
      creditsAttempted: Number(academicRecord?.creditsAttempted ?? 0),
      creditsEarned: Number(academicRecord?.creditsEarned ?? 0),
      cumulativeGpa: Number(academicRecord?.cumulativeGpa ?? 0),
      termGpa: Number(academicRecord?.termGpa ?? 0),
      enrollmentStatus: student.enrollmentStatus ?? 'full_time',
      academicStanding: (academicRecord?.standing as StudentState['academicStanding']) ?? 'good',
      level: student.level ?? 'freshman',
      expectedGraduation: student.expectedGraduation ?? '',

      sapStatus: (sapRecord?.status as StudentState['sapStatus']) ?? 'satisfactory',
      sapPaceRate: Number(sapRecord?.paceRate ?? 1),
      sapTimeframeUsed: Number(sapRecord?.maxTimeframePct ?? 0),
      sapCumulativeGpa: Number(sapRecord?.qualitativeGpa ?? academicRecord?.cumulativeGpa ?? 0),

      program: {
        id: student.program?.id ?? '',
        code: student.program?.code ?? '',
        name: student.program?.name ?? '',
        degreeType: student.program?.degreeType ?? null,
        totalCredits: student.program?.totalCredits ?? null,
      },

      enrollments: enrollments.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        courseCode: e.course.code,
        courseTitle: e.course.title,
        credits: Number(e.course.credits),
        status: e.status,
        grade: e.grade ?? null,
        isRepeated: e.isRepeated,
      })),

      aidAwards: aidAwards.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.aidType,
        amount: Number(a.amount),
        status: a.status ?? 'offered',
        conditions: (a.conditions as StudentState['aidAwards'][0]['conditions']) ?? [],
      })),

      scholarships: scholarships.map((s) => ({
        id: s.id,
        name: s.name,
        amount: Number(s.amount ?? 0),
        conditions: (s.conditions as StudentState['scholarships'][0]['conditions']) ?? [],
      })),

      totalAidAmount,
    };
  }

  /**
   * Loads active rules from the database and instantiates the RuleEngine.
   */
  async loadRuleEngine(institutionId: string, asOfDate = new Date()): Promise<RuleEngine> {
    const dateStr = asOfDate.toISOString().split('T')[0]!;

    const dbRules = await this.db.query.rules.findMany({
      where: and(
        eq(schema.rules.institutionId, institutionId),
        eq(schema.rules.status, 'active'),
      ),
    });

    const ruleDefs: RuleDefinition[] = dbRules
      .filter((r) => {
        const from = r.effectiveFrom;
        const to = r.effectiveTo;
        return (!from || from <= dateStr) && (!to || to >= dateStr);
      })
      .map((r) => ({
        id: r.id,
        ruleCode: r.ruleCode,
        type: r.type,
        name: r.name,
        description: r.description ?? undefined,
        condition: r.conditionJson as RuleDefinition['condition'],
        result: r.resultJson as RuleDefinition['result'],
        priority: r.priority,
        status: r.status ?? 'active',
        effectiveFrom: r.effectiveFrom ?? dateStr,
        effectiveTo: r.effectiveTo ?? undefined,
        policyVersionId: r.policyVersionId ?? undefined,
      }));

    return new RuleEngine(ruleDefs);
  }
}
