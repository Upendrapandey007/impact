import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '@impact/database';
import { schema } from '@impact/database';
import { ConditionEvaluator } from '@impact/rules';
import type { StudentState } from '@impact/types';
import type { AuthUser } from '../../common/decorators/index';
import { DATABASE_TOKEN } from '../../providers/database.module';
import type { CreateRuleDto, TestRuleDto } from './dto/create-rule.dto';
import { SimulationsService } from '../simulations/simulations.service';

@Injectable()
export class RulesService {
  private readonly evaluator = new ConditionEvaluator();

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly simulationsService: SimulationsService,
  ) {}

  /**
   * Create a new deterministic policy rule.
   */
  async createRule(dto: CreateRuleDto, actor: AuthUser) {
    const [rule] = await this.db
      .insert(schema.rules)
      .values({
        institutionId: actor.institutionId,
        ruleCode: dto.ruleCode.trim(),
        policyVersionId: dto.policyVersionId ?? null,
        type: dto.type,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        conditionJson: dto.conditionJson as unknown as Record<string, unknown>,
        resultJson: dto.resultJson as unknown as Record<string, unknown>,
        priority: dto.priority ?? 100,
        status: dto.status ?? 'active',
        effectiveFrom: dto.effectiveFrom,
        effectiveTo: dto.effectiveTo ?? null,
        createdBy: actor.id,
      })
      .returning();

    return rule;
  }

  /**
   * Get a rule by ID.
   */
  async getRule(ruleId: string, actor: AuthUser) {
    const rule = await this.db.query.rules.findFirst({
      where: and(
        eq(schema.rules.id, ruleId),
        eq(schema.rules.institutionId, actor.institutionId),
      ),
      with: {
        policyVersion: true,
      },
    });

    if (!rule) {
      throw new NotFoundException(`Rule ${ruleId} not found`);
    }

    return rule;
  }

  /**
   * List rules with optional filters.
   */
  async listRules(
    actor: AuthUser,
    filters: { type?: string; status?: string; policyVersionId?: string } = {},
  ) {
    const conditions = [eq(schema.rules.institutionId, actor.institutionId)];

    if (filters.type) {
      conditions.push(eq(schema.rules.type, filters.type as any));
    }
    if (filters.status) {
      conditions.push(eq(schema.rules.status, filters.status as any));
    }
    if (filters.policyVersionId) {
      conditions.push(eq(schema.rules.policyVersionId, filters.policyVersionId));
    }

    return this.db.query.rules.findMany({
      where: and(...conditions),
      orderBy: [schema.rules.priority],
      with: {
        policyVersion: true,
      },
    });
  }

  /**
   * Admin Rule Test Harness: Evaluates a rule against a student state and returns the step-by-step trace.
   */
  async testRule(ruleId: string, dto: TestRuleDto, actor: AuthUser) {
    const rule = await this.getRule(ruleId, actor);

    let state: StudentState;

    if (dto.studentId) {
      state = await this.simulationsService.buildStudentState(
        dto.studentId,
        actor.institutionId,
      );
    } else if (dto.studentState) {
      state = dto.studentState as unknown as StudentState;
    } else {
      throw new Error('Either studentId or studentState must be provided to test a rule');
    }

    const trace = this.evaluator.evaluateWithTrace(
      rule.conditionJson as unknown as Parameters<typeof this.evaluator.evaluateWithTrace>[0],
      state,
    );

    return {
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleName: rule.name,
      passed: trace.passed,
      expectedResult: rule.resultJson,
      evaluationTrace: trace,
      studentEvaluated: {
        studentId: state.studentId,
        creditsEnrolled: state.creditsEnrolled,
        cumulativeGpa: state.cumulativeGpa,
        sapPaceRate: state.sapPaceRate,
      },
    };
  }
}
