import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import type { AuthUser } from '../../common/decorators/index';
import { DATABASE_TOKEN } from '../../providers/database.module';
import type {
  CreateAdvisorNoteDto,
  RecommendOpportunityDto,
  RiskOverrideDto,
  RiskQueueFilterDto,
} from './dto/advisor-queue.dto';

@Injectable()
export class AdvisorService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Retrieves the advisor's student risk queue with cohort metrics and multi-filter sorting.
   */
  async getRiskQueue(dto: RiskQueueFilterDto, actor: AuthUser) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    // Load recent simulations for this institution
    const recentSimulations = await this.db.query.simulations.findMany({
      where: and(
        eq(schema.simulations.institutionId, actor.institutionId),
        eq(schema.simulations.status, 'completed'),
      ),
      orderBy: [desc(schema.simulations.createdAt)],
      with: {
        student: {
          with: {
            program: true,
            user: true,
          },
        },
        scenario: true,
      },
      limit: 100,
    });

    // Compute cohort summary metrics
    const metrics = {
      totalSimulations: recentSimulations.length,
      totalCritical: recentSimulations.filter((s) => s.overallRisk === 'critical').length,
      totalHigh: recentSimulations.filter((s) => s.overallRisk === 'high').length,
      totalModerate: recentSimulations.filter((s) => s.overallRisk === 'moderate').length,
      totalLow: recentSimulations.filter((s) => s.overallRisk === 'low').length,
    };

    // Filter by risk level & major if requested
    let filtered = recentSimulations;
    if (dto.riskLevel) {
      filtered = filtered.filter((s) => s.overallRisk === dto.riskLevel);
    }
    if (dto.major) {
      const targetMajor = dto.major.toUpperCase();
      filtered = filtered.filter(
        (s) => s.student?.program?.code?.toUpperCase() === targetMajor,
      );
    }

    const paginated = filtered.slice(offset, offset + limit);

    return {
      data: paginated.map((s) => ({
        simulationId: s.id,
        studentId: s.studentId,
        studentName: s.student?.user?.name ?? 'Student',
        studentEmail: s.student?.user?.email ?? '',
        major: s.student?.program?.code ?? 'Undeclared',
        programName: s.student?.program?.name ?? '',
        scenarioType: s.scenario?.type ?? 'UNKNOWN',
        overallRisk: s.overallRisk,
        riskScores: s.riskScores,
        simulatedAt: s.createdAt,
      })),
      metrics,
      total: filtered.length,
      page,
      limit,
    };
  }

  /**
   * Get detailed student profile, full simulation replay timeline, and advisor notes.
   */
  async getStudentDetail(studentId: string, actor: AuthUser) {
    const student = await this.db.query.students.findFirst({
      where: and(
        eq(schema.students.id, studentId),
        eq(schema.students.institutionId, actor.institutionId),
      ),
      with: {
        user: true,
        program: true,
        advisor: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    // Load full simulation history
    const simulations = await this.db.query.simulations.findMany({
      where: and(
        eq(schema.simulations.studentId, studentId),
        eq(schema.simulations.institutionId, actor.institutionId),
      ),
      orderBy: [desc(schema.simulations.createdAt)],
      with: {
        scenario: true,
        impacts: true,
      },
    });

    return {
      student,
      simulations,
      totalSimulations: simulations.length,
    };
  }

  /**
   * Log an advisor note on a student's record with optional student visibility.
   */
  async createAdvisorNote(
    studentId: string,
    dto: CreateAdvisorNoteDto,
    actor: AuthUser,
  ) {
    // Verify student exists
    const student = await this.db.query.students.findFirst({
      where: and(
        eq(schema.students.id, studentId),
        eq(schema.students.institutionId, actor.institutionId),
      ),
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    // Write audit log for the note
    await this.db.insert(schema.auditLogs).values({
      institutionId: actor.institutionId,
      actorId: actor.id,
      actorRole: actor.role,
      action: 'ADVISOR_NOTE_CREATED',
      resourceType: 'student',
      resourceId: studentId,
      metadata: {
        content: dto.content,
        isSharedWithStudent: dto.isSharedWithStudent,
        actionItem: dto.actionItem ?? null,
      },
    });

    return {
      success: true,
      studentId,
      createdNote: {
        authorId: actor.id,
        content: dto.content,
        isSharedWithStudent: dto.isSharedWithStudent ?? false,
        actionItem: dto.actionItem ?? null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Formal Advisor Risk Override: Overrides a computed risk level with mandatory justification and audit logging.
   */
  async overrideRisk(
    simulationId: string,
    dto: RiskOverrideDto,
    actor: AuthUser,
  ) {
    const simulation = await this.db.query.simulations.findFirst({
      where: and(
        eq(schema.simulations.id, simulationId),
        eq(schema.simulations.institutionId, actor.institutionId),
      ),
    });

    if (!simulation) {
      throw new NotFoundException(`Simulation ${simulationId} not found`);
    }

    const previousRisk = simulation.overallRisk;

    // Update simulation with new risk level
    const [updated] = await this.db
      .update(schema.simulations)
      .set({
        overallRisk: dto.overriddenRiskLevel,
        riskScores: (dto.revisedRiskScores ?? simulation.riskScores) as unknown as Record<string, unknown>,
      })
      .where(eq(schema.simulations.id, simulationId))
      .returning();

    // Insert mandatory immutable audit log
    await this.db.insert(schema.auditLogs).values({
      institutionId: actor.institutionId,
      actorId: actor.id,
      actorRole: actor.role,
      action: 'RISK_OVERRIDE_APPLIED',
      resourceType: 'simulation',
      resourceId: simulationId,
      beforeState: { overallRisk: previousRisk, riskScores: simulation.riskScores },
      afterState: { overallRisk: dto.overriddenRiskLevel, riskScores: dto.revisedRiskScores ?? simulation.riskScores },
      metadata: {
        justificationReason: dto.justificationReason,
        overriddenBy: actor.id,
        previousRisk,
        newRisk: dto.overriddenRiskLevel,
      },
    });

    return {
      success: true,
      simulationId,
      previousRisk,
      newRisk: dto.overriddenRiskLevel,
      justificationReason: dto.justificationReason,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Dispatch a recommended opportunity (job or scholarship) directly to a student.
   */
  async recommendOpportunity(
    studentId: string,
    dto: RecommendOpportunityDto,
    actor: AuthUser,
  ) {
    const opportunity = await this.db.query.opportunities.findFirst({
      where: eq(schema.opportunities.id, dto.opportunityId),
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity ${dto.opportunityId} not found`);
    }

    // Write audit log of advisor recommendation
    await this.db.insert(schema.auditLogs).values({
      institutionId: actor.institutionId,
      actorId: actor.id,
      actorRole: actor.role,
      action: 'OPPORTUNITY_RECOMMENDED',
      resourceType: 'student',
      resourceId: studentId,
      metadata: {
        opportunityId: dto.opportunityId,
        opportunityTitle: opportunity.title,
        advisorNote: dto.note ?? null,
      },
    });

    return {
      success: true,
      studentId,
      opportunityTitle: opportunity.title,
      note: dto.note ?? null,
      dispatchedAt: new Date().toISOString(),
    };
  }
}
