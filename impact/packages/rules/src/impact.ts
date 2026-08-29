import type {
  Impact,
  ImpactCategory,
  RecommendedAction,
  RiskLevel,
  RuleEvaluation,
  StudentState,
} from '@impact/types';

/**
 * ImpactCalculator
 *
 * Performs differential evaluation between current and hypothetical states.
 * Identifies what changed, builds Impact objects, and generates recommended actions.
 */
export class ImpactCalculator {
  /**
   * Compares two sets of rule evaluations (current vs. hypothetical).
   * Returns only the evaluations where the outcome changed.
   */
  calculateDifferential(
    currentEvaluations: RuleEvaluation[],
    hypotheticalEvaluations: RuleEvaluation[],
    currentState: StudentState,
    hypotheticalState: StudentState,
  ): Impact[] {
    const impacts: Impact[] = [];

    // Map current evaluations by rule ID for O(1) lookup
    const currentMap = new Map(currentEvaluations.map((e) => [e.ruleId, e]));

    for (const hypoEval of hypotheticalEvaluations) {
      const currentEval = currentMap.get(hypoEval.ruleId);
      if (!currentEval) continue;

      // Detect changes
      const outcomeChanged =
        currentEval.passed !== hypoEval.passed ||
        JSON.stringify(currentEval.result) !== JSON.stringify(hypoEval.result);

      // Build impact regardless of whether it changed (severity may be 'none')
      const impact = this.buildImpact(
        currentEval,
        hypoEval,
        outcomeChanged,
        currentState,
        hypotheticalState,
      );

      if (impact) {
        impacts.push(impact);
      }
    }

    // Sort: changed impacts first, then by severity
    return impacts.sort((a, b) => {
      if (a.changed !== b.changed) return a.changed ? -1 : 1;
      return this.severityOrder(b.severity) - this.severityOrder(a.severity);
    });
  }

  private buildImpact(
    current: RuleEvaluation,
    hypothetical: RuleEvaluation,
    changed: boolean,
    currentState: StudentState,
    hypotheticalState: StudentState,
  ): Impact | null {
    const category = this.ruleTypeToCategory(current.ruleType);
    if (!category) return null;

    const severity = changed
      ? this.calculateSeverity(current, hypothetical, currentState, hypotheticalState)
      : 'none';

    const { title, description, currentValue, projectedValue } = this.buildDescription(
      current,
      hypothetical,
      currentState,
      hypotheticalState,
      category,
    );

    return {
      category,
      severity,
      changed,
      title,
      description,
      currentValue,
      projectedValue,
      ruleId: current.ruleId,
      ruleCode: current.ruleCode,
      policyVersionId: current.policyVersionId,
      evidence: [],
    };
  }

  private calculateSeverity(
    current: RuleEvaluation,
    hypothetical: RuleEvaluation,
    currentState: StudentState,
    hypotheticalState: StudentState,
  ): RiskLevel | 'none' {
    const category = this.ruleTypeToCategory(current.ruleType);

    switch (category) {
      case 'scholarship':
        // Was eligible, now not → high risk
        if (current.passed && !hypothetical.passed) return 'high';
        return 'none';

      case 'sap':
        if (current.passed && !hypothetical.passed) return 'critical';
        if (
          hypothetical.result['status'] === 'probation' &&
          current.result['status'] === 'satisfactory'
        )
          return 'high';
        return 'moderate';

      case 'financial_aid':
        if (current.passed && !hypothetical.passed) return 'critical';
        return 'high';

      case 'enrollment_status': {
        const oldStatus = currentState.enrollmentStatus;
        const newStatus = hypotheticalState.enrollmentStatus;
        if (newStatus === 'withdrawn') return 'critical';
        if (newStatus === 'less_than_half_time' && oldStatus !== 'less_than_half_time')
          return 'high';
        if (newStatus === 'half_time' && oldStatus === 'full_time') return 'moderate';
        return 'low';
      }

      case 'graduation':
        if (current.passed && !hypothetical.passed) return 'high';
        return 'moderate';

      case 'gpa':
        if (!hypothetical.passed) return 'high';
        return 'moderate';

      case 'compliance':
        if (!hypothetical.passed) return 'critical';
        return 'moderate';

      default:
        return current.passed !== hypothetical.passed ? 'low' : 'none';
    }
  }

  private buildDescription(
    current: RuleEvaluation,
    hypothetical: RuleEvaluation,
    currentState: StudentState,
    hypotheticalState: StudentState,
    category: ImpactCategory,
  ): Pick<Impact, 'title' | 'description' | 'currentValue' | 'projectedValue'> {
    switch (category) {
      case 'enrollment_status':
        return {
          title: 'Enrollment status may change',
          description: `Your enrollment status would change from ${currentState.enrollmentStatus.replace(/_/g, ' ')} to ${hypotheticalState.enrollmentStatus.replace(/_/g, ' ')}.`,
          currentValue: { status: currentState.enrollmentStatus, credits: currentState.creditsEnrolled },
          projectedValue: { status: hypotheticalState.enrollmentStatus, credits: hypotheticalState.creditsEnrolled },
        };

      case 'scholarship':
        return {
          title: `${current.ruleName}`,
          description: current.passed && !hypothetical.passed
            ? `This change may cause you to lose eligibility for this scholarship. The rule requires: ${current.ruleName}.`
            : `Your scholarship eligibility may be affected.`,
          currentValue: { eligible: current.passed },
          projectedValue: { eligible: hypothetical.passed },
        };

      case 'sap':
        return {
          title: 'Satisfactory Academic Progress (SAP) may be affected',
          description: current.passed && !hypothetical.passed
            ? 'This change may put your SAP status at risk, potentially affecting your financial aid eligibility.'
            : 'Your SAP evaluation may change.',
          currentValue: { status: currentState.sapStatus, paceRate: currentState.sapPaceRate },
          projectedValue: { paceRate: hypotheticalState.sapPaceRate },
        };

      case 'financial_aid':
        return {
          title: 'Financial aid eligibility may change',
          description: current.passed && !hypothetical.passed
            ? 'This change may affect your eligibility for federal or institutional financial aid.'
            : 'Your financial aid may be adjusted.',
          currentValue: { eligible: current.passed, amount: currentState.totalAidAmount },
          projectedValue: { eligible: hypothetical.passed },
        };

      case 'graduation':
        return {
          title: 'Graduation timeline may be affected',
          description: 'This change may impact your expected graduation date.',
          currentValue: { expectedGraduation: currentState.expectedGraduation },
          projectedValue: { expectedGraduation: hypotheticalState.expectedGraduation },
        };

      default:
        return {
          title: current.ruleName,
          description: `Rule outcome changed: ${current.passed ? 'passed' : 'failed'} → ${hypothetical.passed ? 'passed' : 'failed'}.`,
          currentValue: current.result,
          projectedValue: hypothetical.result,
        };
    }
  }

  private ruleTypeToCategory(ruleType: string): ImpactCategory | null {
    const map: Record<string, ImpactCategory> = {
      enrollment_status: 'enrollment_status',
      scholarship_eligibility: 'scholarship',
      sap_quantitative: 'sap',
      sap_qualitative: 'sap',
      sap_timeframe: 'sap',
      aid_eligibility: 'financial_aid',
      graduation_requirement: 'graduation',
      credit_requirement: 'enrollment_status',
      gpa_requirement: 'gpa',
    };
    return map[ruleType] ?? null;
  }

  private severityOrder(severity: string): number {
    const order: Record<string, number> = {
      critical: 5,
      high: 4,
      moderate: 3,
      low: 2,
      none: 1,
    };
    return order[severity] ?? 0;
  }

  /**
   * Generates recommended actions based on the impact set.
   */
  generateRecommendedActions(
    impacts: Impact[],
    currentState: StudentState,
  ): RecommendedAction[] {
    const actions: RecommendedAction[] = [];
    const changedImpacts = impacts.filter((i) => i.changed && i.severity !== 'none');

    const hasFinancialImpact = changedImpacts.some(
      (i) => i.category === 'financial_aid' || i.category === 'scholarship',
    );
    const hasSAPImpact = changedImpacts.some((i) => i.category === 'sap');
    const hasCritical = changedImpacts.some((i) => i.severity === 'critical');
    const hasGraduationImpact = changedImpacts.some((i) => i.category === 'graduation');

    if (hasCritical || hasSAPImpact) {
      actions.push({
        priority: 1,
        action: 'CONTACT_FINANCIAL_AID',
        title: 'Contact Financial Aid immediately',
        description:
          'This change may have serious financial implications. Speak with a financial aid officer before proceeding.',
      });
    }

    if (hasFinancialImpact) {
      actions.push({
        priority: hasCritical ? 2 : 1,
        action: 'CONTACT_ADVISOR',
        title: 'Speak with your academic advisor',
        description:
          'Your advisor can help you understand your options and find alternatives that avoid financial risk.',
      });
    }

    if (hasGraduationImpact && !hasFinancialImpact) {
      actions.push({
        priority: 1,
        action: 'CONTACT_ADVISOR',
        title: 'Review your degree plan with your advisor',
        description:
          'This change may affect your graduation timeline. Your advisor can help you re-sequence your courses.',
      });
    }

    if (changedImpacts.length > 0) {
      actions.push({
        priority: actions.length + 1,
        action: 'EXPLORE_ALTERNATIVES',
        title: 'Explore alternative options',
        description:
          'There may be alternative courses or decisions that achieve your goal while minimizing risk.',
      });
    }

    if (changedImpacts.length === 0) {
      actions.push({
        priority: 1,
        action: 'NO_ACTION_NEEDED',
        title: 'No significant risk detected',
        description:
          'Based on the current policies, this decision does not appear to create significant financial or academic risk.',
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }
}
