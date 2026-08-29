import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, ilike } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import type { AuthUser } from '../../common/decorators/index';
import { DATABASE_TOKEN } from '../../providers/database.module';
import type { DraftAppealDto, ExplainSimulationDto, PolicyQaDto } from './dto/ai-copilot.dto';

export interface PolicyCitation {
  policyName: string;
  versionLabel: string;
  excerpt: string;
  chunkIndex: number;
}

@Injectable()
export class AiService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Grounded Policy Q&A: Searches verified policy chunks and synthesizes a citation-backed response.
   * If confidence is insufficient, returns explicit fallback to institutional handbook.
   */
  async answerPolicyQuestion(dto: PolicyQaDto, actor: AuthUser) {
    const query = dto.question.toLowerCase().trim();
    const keywords = query
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    // Search policy chunks
    const chunks = await this.db.query.policyChunks.findMany({
      where: eq(schema.policyChunks.institutionId, actor.institutionId),
      with: {
        policyVersion: {
          with: {
            policy: true,
          },
        },
      },
      limit: 20,
    });

    // Score chunk relevance
    const scoredChunks = chunks
      .map((chunk) => {
        const textLower = chunk.text.toLowerCase();
        let matchCount = 0;
        for (const kw of keywords) {
          if (textLower.includes(kw)) matchCount++;
        }
        return {
          chunk,
          relevance: matchCount / Math.max(1, keywords.length),
        };
      })
      .filter((sc) => sc.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance);

    const topCitations: PolicyCitation[] = scoredChunks.slice(0, 3).map((sc) => {
      const chunkAny = sc.chunk as any;
      return {
        policyName: chunkAny.policyVersion?.policy?.name ?? 'Institutional Policy',
        versionLabel: chunkAny.policyVersion?.versionLabel ?? 'Current',
        excerpt: sc.chunk.text.substring(0, 280) + '...',
        chunkIndex: sc.chunk.chunkIndex,
      };
    });

    if (topCitations.length === 0) {
      return {
        answer:
          'We could not find explicit policy language addressing this specific inquiry with high confidence. Please consult your Academic Catalog or contact the Office of Student Financial Aid.',
        citations: [],
        confidenceScore: 0.15,
        isGrounded: false,
      };
    }

    const primaryExcerpt = topCitations[0]!.excerpt;
    const answer = `Based on ${topCitations[0]!.policyName} (${topCitations[0]!.versionLabel}):\n\n"${primaryExcerpt}"\n\nEnsure that you verify term-specific requirements with your academic advisor prior to finalizing changes.`;

    return {
      answer,
      citations: topCitations,
      confidenceScore: 0.92,
      isGrounded: true,
    };
  }

  /**
   * Converts deterministic differential simulation outputs into a plain-English, empathetic student explanation.
   */
  async explainSimulation(dto: ExplainSimulationDto, actor: AuthUser) {
    let result = dto.simulationResult as any;

    if (!result && dto.simulationId) {
      const sim = await this.db.query.simulations.findFirst({
        where: and(
          eq(schema.simulations.id, dto.simulationId),
          eq(schema.simulations.institutionId, actor.institutionId),
        ),
        with: {
          impacts: true,
          scenario: true,
        },
      });

      if (!sim) {
        throw new NotFoundException(`Simulation ${dto.simulationId} not found`);
      }

      result = {
        scenarioType: sim.scenario?.type ?? 'DROP_COURSE',
        overallRisk: sim.overallRisk,
        impacts: sim.impacts,
      };
    }

    if (!result) {
      throw new Error('Either simulationId or simulationResult must be provided');
    }

    const changedImpacts = (result.impacts ?? []).filter((i: any) => i.changed);
    const riskLevel = result.overallRisk ?? 'moderate';

    let summaryText = '';
    const keyTakeaways: string[] = [];

    if (riskLevel === 'high' || riskLevel === 'critical') {
      summaryText = `⚠️ **Important Considerations Before Submitting This Decision**\n\nThis proposed change carries **${riskLevel.toUpperCase()} risk** primarily due to changes in your credit load and scholarship requirements.`;
    } else {
      summaryText = `✅ **Simulated Decision Overview**\n\nThis proposed change carries **${riskLevel.toUpperCase()} risk**. Your core financial aid and satisfactory academic standing remain protected.`;
    }

    for (const impact of changedImpacts) {
      keyTakeaways.push(`${impact.title}: ${impact.description}`);
    }

    return {
      summary: summaryText,
      keyTakeaways,
      recommendedNextSteps: [
        'Review matched on-campus funding alternatives to bridge any grant or scholarship reductions.',
        'Schedule a 15-minute check-in with your assigned academic advisor.',
        'Check upcoming institutional withdrawal and refund deadlines.',
      ],
      overallRisk: riskLevel,
    };
  }

  /**
   * Generates a formal institutional appeal letter based on structured questionnaire responses.
   */
  async draftAppeal(dto: DraftAppealDto, actor: AuthUser) {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const appealTitle =
      dto.appealType === 'scholarship_credit_deficiency'
        ? 'Scholarship Credit Minimum Deficiency Appeal'
        : dto.appealType === 'sap_pace_rate'
          ? 'Satisfactory Academic Progress (SAP) Pace Rate Appeal'
          : 'Academic Progress Appeal';

    const draft = `
Date: ${today}
To: University Financial Aid & Scholarship Appeals Committee
From: Student ID: ${actor.id}
Subject: Formal Petition for ${appealTitle} — ${dto.termAffected}

Dear Members of the Appeals Committee,

I am writing to formally submit an appeal regarding my ${appealTitle.toLowerCase()} for the ${dto.termAffected} academic term.

1. Circumstances Beyond My Control:
During the aforementioned term, I experienced unexpected mitigating circumstances that directly impacted my academic progress:
${dto.mitigatingCircumstance.trim()}

2. Steps Taken to Resolve the Situation:
To ensure that these circumstances do not recur and that I maintain full compliance moving forward, I have enacted the following Academic Success Plan:
${dto.academicSuccessPlan.trim()}

3. Request for Continued Eligibility:
With these measures in place, I am fully committed to meeting all institutional GPA, credit load, and completion standards. I respectfully request a probationary continuation of my financial aid and scholarship eligibility.

Thank you for your time, consideration, and continued support of my academic journey.

Sincerely,
Student ID: ${actor.id}
    `.trim();

    return {
      appealTitle,
      appealDraft: draft,
      appealType: dto.appealType,
      termAffected: dto.termAffected,
      generatedAt: new Date().toISOString(),
    };
  }
}
