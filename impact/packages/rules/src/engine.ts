import type {
  RuleCondition,
  RuleEvaluation,
  RuleResult,
  RuleStatus,
  RuleType,
  ScenarioType,
  SimulationResult,
  StudentState,
} from '@impact/types';

import { ConditionEvaluator } from './evaluator';
import { ImpactCalculator } from './impact';
import { RiskScorer } from './risk';
import { ScenarioBuilder } from './scenario';

// ─── Rule definition (as loaded from DB or config) ────────────────────────────

export interface RuleDefinition {
  id: string;
  ruleCode: string;
  type: RuleType;
  name: string;
  description?: string;
  condition: RuleCondition;
  result: RuleResult;
  priority: number;
  status: RuleStatus;
  effectiveFrom: string; // ISO date
  effectiveTo?: string;  // ISO date
  policyVersionId?: string;
}

// ─── Engine Options ───────────────────────────────────────────────────────────

export interface RuleEngineOptions {
  /** Date to evaluate rules as-of. Defaults to now. */
  asOfDate?: Date;
  /** If true, evaluates ALL rules (even if outcome unchanged). Defaults to false. */
  includeUnchanged?: boolean;
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

/**
 * RuleEngine
 *
 * Orchestrates the full simulation pipeline:
 * 1. Build hypothetical state (ScenarioBuilder)
 * 2. Evaluate current state against all applicable rules (ConditionEvaluator)
 * 3. Evaluate hypothetical state against all applicable rules
 * 4. Diff evaluations → Impacts (ImpactCalculator)
 * 5. Score risk (RiskScorer)
 * 6. Generate recommended actions
 *
 * This is the ONLY component that may determine impact.
 * LLMs are not used here.
 */
export class RuleEngine {
  private readonly evaluator: ConditionEvaluator;
  private readonly scenarioBuilder: ScenarioBuilder;
  private readonly impactCalculator: ImpactCalculator;
  private readonly riskScorer: RiskScorer;

  constructor(private readonly rules: RuleDefinition[]) {
    this.evaluator = new ConditionEvaluator();
    this.scenarioBuilder = new ScenarioBuilder();
    this.impactCalculator = new ImpactCalculator();
    this.riskScorer = new RiskScorer();
  }

  /**
   * Run a simulation:
   * - currentState: student's real current state
   * - scenarioType: the type of decision being simulated
   * - parameters: decision parameters (courseId, targetCredits, etc.)
   */
  simulate(
    currentState: StudentState,
    scenarioType: ScenarioType,
    parameters: Record<string, unknown>,
    options: RuleEngineOptions = {},
  ): SimulationResult {
    const asOfDate = options.asOfDate ?? new Date();

    // 1. Build hypothetical state
    const hypotheticalState = this.scenarioBuilder.build(
      scenarioType,
      currentState,
      parameters,
    );

    // 2. Get applicable rules for this scenario type
    const applicableRules = this.getApplicableRules(asOfDate);

    // 3. Evaluate current state
    const currentEvaluations = this.evaluateState(currentState, applicableRules);

    // 4. Evaluate hypothetical state
    const hypotheticalEvaluations = this.evaluateState(hypotheticalState, applicableRules);

    // 5. Differential impact calculation
    const impacts = this.impactCalculator.calculateDifferential(
      currentEvaluations,
      hypotheticalEvaluations,
      currentState,
      hypotheticalState,
    );

    // 6. Risk scoring
    const { overallLevel, ...riskScores } = this.riskScorer.score(impacts);

    // 7. Recommended actions
    const recommendedActions = this.impactCalculator.generateRecommendedActions(
      impacts,
      currentState,
    );

    return {
      scenarioType,
      overallRisk: overallLevel,
      riskScores: {
        financial: riskScores.financial,
        academic: riskScores.academic,
        graduation: riskScores.graduation,
        compliance: riskScores.compliance,
        administrative: riskScores.administrative,
        overall: riskScores.overall,
      },
      impacts,
      currentEvaluations,
      hypotheticalEvaluations,
      recommendedActions,
      policyVersionIds: [
        ...new Set(applicableRules.map((r) => r.policyVersionId).filter(Boolean) as string[]),
      ],
      ruleIds: applicableRules.map((r) => r.id),
    };
  }

  /**
   * Evaluate a single state against a set of rules.
   */
  private evaluateState(
    state: StudentState,
    rules: RuleDefinition[],
  ): RuleEvaluation[] {
    return rules.map((rule) => {
      const trace = this.evaluator.evaluateWithTrace(rule.condition, state);
      return {
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleName: rule.name,
        ruleType: rule.type,
        passed: trace.passed,
        result: rule.result,
        trace,
        policyVersionId: rule.policyVersionId,
      };
    });
  }

  /**
   * Filters rules to those active and in-effect as of the given date.
   * Sorted by priority (lower number = higher priority).
   */
  private getApplicableRules(asOfDate: Date): RuleDefinition[] {
    return this.rules
      .filter((rule) => rule.status === 'active')
      .filter((rule) => {
        const from = new Date(rule.effectiveFrom);
        const to = rule.effectiveTo ? new Date(rule.effectiveTo) : null;
        return from <= asOfDate && (to === null || to >= asOfDate);
      })
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Test a single rule against a given student state.
   * Used by the admin rule test harness.
   */
  testRule(
    rule: RuleDefinition,
    state: StudentState,
  ): { passed: boolean; result: RuleResult; trace: RuleEvaluation['trace'] } {
    const trace = this.evaluator.evaluateWithTrace(rule.condition, state);
    return {
      passed: trace.passed,
      result: rule.result,
      trace,
    };
  }

  /**
   * Returns the count of active, applicable rules.
   */
  get activeRuleCount(): number {
    return this.rules.filter((r) => r.status === 'active').length;
  }
}
