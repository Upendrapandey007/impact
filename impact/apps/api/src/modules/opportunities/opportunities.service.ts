import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import type { Opportunity, OpportunityEligibilityCriteria, OpportunityMatch } from '@impact/types';
import type { AuthUser } from '../../common/decorators/index';
import { DATABASE_TOKEN } from '../../providers/database.module';
import type { CreateOpportunitySourceDto, OpportunityQueryDto } from './dto/opportunity.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly studentsService: StudentsService,
  ) {}

  /**
   * Register a new web scraping or RSS feed source.
   */
  async createSource(dto: CreateOpportunitySourceDto, actor: AuthUser) {
    const [source] = await this.db
      .insert(schema.opportunitySources)
      .values({
        institutionId: actor.institutionId,
        name: dto.name.trim(),
        sourceType: dto.sourceType,
        targetUrl: dto.targetUrl.trim(),
        robotsPolicyUrl: dto.robotsPolicyUrl?.trim() ?? null,
        rateLimitPerMin: dto.rateLimitPerMin ?? 30,
        scrapeConfig: dto.scrapeConfig ?? {},
        isActive: true,
      })
      .returning();

    return source;
  }

  /**
   * List configured opportunity sources for the institution.
   */
  async listSources(actor: AuthUser) {
    return this.db.query.opportunitySources.findMany({
      where: eq(schema.opportunitySources.institutionId, actor.institutionId),
      orderBy: [desc(schema.opportunitySources.createdAt)],
    });
  }

  /**
   * List active scholarships, student jobs, and grants.
   */
  async listOpportunities(dto: OpportunityQueryDto, actor: AuthUser) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [
      eq(schema.opportunities.status, 'active'),
    ];

    if (dto.type) {
      conditions.push(eq(schema.opportunities.type, dto.type as any));
    }

    const items = await this.db.query.opportunities.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.opportunities.createdAt)],
      limit,
      offset,
    });

    return {
      data: items,
      page,
      limit,
    };
  }

  /**
   * Match student profile against all active opportunities.
   * Identifies eligible scholarships & student jobs (e.g. to offset financial aid reductions).
   */
  async matchStudentOpportunities(
    studentId: string,
    actor: AuthUser,
  ): Promise<{ matches: OpportunityMatch[]; totalEligible: number }> {
    const profile = await this.studentsService.getStudentById(studentId, actor);

    const allOpportunities = await this.db.query.opportunities.findMany({
      where: eq(schema.opportunities.status, 'active'),
    });

    const matches: OpportunityMatch[] = [];

    const studentGpa = profile.academicSummary.cumulativeGpa;
    const studentCredits = profile.academicSummary.creditsEnrolled;
    const studentMajor = profile.program?.code?.toUpperCase() ?? '';

    for (const opp of allOpportunities) {
      const eligibility = (opp.eligibilityCriteria ?? {}) as OpportunityEligibilityCriteria;
      const matchedCriteria: string[] = [];
      const unmetCriteria: string[] = [];
      let score = 100;

      // Check GPA
      if (eligibility.minGpa !== undefined) {
        if (studentGpa >= eligibility.minGpa) {
          matchedCriteria.push(`GPA ${studentGpa.toFixed(2)} meets minimum ${eligibility.minGpa}`);
        } else {
          unmetCriteria.push(`GPA ${studentGpa.toFixed(2)} is below minimum ${eligibility.minGpa}`);
          score -= 40;
        }
      }

      // Check Enrolled Credits
      if (eligibility.minCreditsEnrolled !== undefined) {
        if (studentCredits >= eligibility.minCreditsEnrolled) {
          matchedCriteria.push(
            `Enrolled in ${studentCredits} credits (requires >= ${eligibility.minCreditsEnrolled})`,
          );
        } else {
          unmetCriteria.push(
            `Enrolled in ${studentCredits} credits (requires >= ${eligibility.minCreditsEnrolled})`,
          );
          score -= 30;
        }
      }

      // Check Major
      if (eligibility.requiredMajorCodes && eligibility.requiredMajorCodes.length > 0) {
        const uppercaseRequired = eligibility.requiredMajorCodes.map((m) => m.toUpperCase());
        if (studentMajor && uppercaseRequired.includes(studentMajor)) {
          matchedCriteria.push(`Major (${studentMajor}) is eligible`);
        } else {
          unmetCriteria.push(`Major (${studentMajor}) is not in eligible list (${uppercaseRequired.join(', ')})`);
          score -= 30;
        }
      }

      const isEligible = unmetCriteria.length === 0;

      matches.push({
        opportunity: opp as unknown as Opportunity,
        matchScore: Math.max(0, score),
        matchedCriteria,
        unmetCriteria,
        isEligible,
      });
    }

    // Sort: eligible first, then highest match score
    matches.sort((a, b) => {
      if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
      return b.matchScore - a.matchScore;
    });

    return {
      matches,
      totalEligible: matches.filter((m) => m.isEligible).length,
    };
  }

  /**
   * Helper to insert a normalized opportunity with SHA-256 deduplication.
   */
  async upsertOpportunity(
    sourceId: string,
    data: {
      type: 'scholarship' | 'student_job' | 'work_study' | 'grant' | 'emergency_aid' | 'fellowship' | 'internship';
      title: string;
      provider: string;
      description: string;
      amountOrWage?: string;
      amountNumeric?: number;
      applicationDeadline?: string;
      sourceUrl: string;
      sourceDomain: string;
      eligibilityCriteria: OpportunityEligibilityCriteria;
      tags?: string[];
    },
    institutionId?: string,
  ) {
    const contentHash = createHash('sha256')
      .update(`${data.title}:${data.sourceUrl}:${data.provider}`, 'utf8')
      .digest('hex');

    const [opp] = await this.db
      .insert(schema.opportunities)
      .values({
        institutionId: institutionId ?? null,
        sourceId,
        type: data.type,
        title: data.title.trim(),
        provider: data.provider.trim(),
        description: data.description.trim(),
        amountOrWage: data.amountOrWage ?? null,
        amountNumeric: data.amountNumeric ? data.amountNumeric.toFixed(2) : null,
        applicationDeadline: data.applicationDeadline ?? null,
        sourceUrl: data.sourceUrl.trim(),
        sourceDomain: data.sourceDomain.trim(),
        contentHash,
        isVerified: true,
        status: 'active',
        eligibilityCriteria: data.eligibilityCriteria as unknown as Record<string, unknown>,
        tags: (data.tags ?? []) as unknown as Record<string, unknown>[],
        lastScrapedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.opportunities.contentHash,
        set: {
          description: data.description.trim(),
          amountOrWage: data.amountOrWage ?? null,
          applicationDeadline: data.applicationDeadline ?? null,
          lastScrapedAt: new Date(),
        },
      })
      .returning();

    return opp;
  }
}
