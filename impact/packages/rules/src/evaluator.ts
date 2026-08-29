import type {
  ConditionTrace,
  FieldCondition,
  RuleCondition,
  StudentState,
} from '@impact/types';

/**
 * ConditionEvaluator
 *
 * Evaluates rule conditions against a StudentState.
 * Produces a trace of the evaluation for explainability.
 *
 * Pure function — no side effects, no I/O.
 */
export class ConditionEvaluator {
  /**
   * Evaluates a condition against the given state.
   * Returns true if the condition passes.
   */
  evaluate(condition: RuleCondition, state: StudentState): boolean {
    return this.evaluateWithTrace(condition, state).passed;
  }

  /**
   * Evaluates a condition and returns a detailed trace.
   */
  evaluateWithTrace(condition: RuleCondition, state: StudentState): ConditionTrace {
    switch (condition.type) {
      case 'field':
        return this.evaluateField(condition, state);
      case 'and':
        return this.evaluateAnd(condition.conditions, state);
      case 'or':
        return this.evaluateOr(condition.conditions, state);
      case 'not':
        return this.evaluateNot(condition.condition, state);
    }
  }

  private evaluateField(condition: FieldCondition, state: StudentState): ConditionTrace {
    const fieldValue = this.resolveField(condition.field, state);
    const passed = this.compareValues(fieldValue, condition.operator, condition.value);

    return {
      condition,
      fieldValue,
      passed,
    };
  }

  private evaluateAnd(
    conditions: RuleCondition[],
    state: StudentState,
  ): ConditionTrace {
    const children = conditions.map((c) => this.evaluateWithTrace(c, state));
    const passed = children.every((c) => c.passed);

    return {
      condition: { type: 'and', conditions },
      passed,
      children,
    };
  }

  private evaluateOr(conditions: RuleCondition[], state: StudentState): ConditionTrace {
    const children = conditions.map((c) => this.evaluateWithTrace(c, state));
    const passed = children.some((c) => c.passed);

    return {
      condition: { type: 'or', conditions },
      passed,
      children,
    };
  }

  private evaluateNot(condition: RuleCondition, state: StudentState): ConditionTrace {
    const child = this.evaluateWithTrace(condition, state);
    return {
      condition: { type: 'not', condition },
      passed: !child.passed,
      children: [child],
    };
  }

  /**
   * Resolves a dot-notation field path against a StudentState.
   * e.g. "creditsEnrolled", "sapPaceRate", "program.totalCredits"
   */
  private resolveField(fieldPath: string, state: StudentState): unknown {
    const parts = fieldPath.split('.');
    let current: unknown = state;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  /**
   * Type-safe comparison supporting numbers, strings, and booleans.
   */
  private compareValues(
    fieldValue: unknown,
    operator: FieldCondition['operator'],
    ruleValue: number | string | boolean,
  ): boolean {
    if (fieldValue === undefined || fieldValue === null) return false;

    // Numeric comparison
    if (typeof ruleValue === 'number') {
      const numValue =
        typeof fieldValue === 'string' ? parseFloat(fieldValue) : Number(fieldValue);
      if (isNaN(numValue)) return false;

      switch (operator) {
        case '>':
          return numValue > ruleValue;
        case '>=':
          return numValue >= ruleValue;
        case '<':
          return numValue < ruleValue;
        case '<=':
          return numValue <= ruleValue;
        case '==':
          return numValue === ruleValue;
        case '!=':
          return numValue !== ruleValue;
      }
    }

    // Boolean comparison
    if (typeof ruleValue === 'boolean') {
      const boolValue =
        typeof fieldValue === 'boolean' ? fieldValue : fieldValue === 'true';
      switch (operator) {
        case '==':
          return boolValue === ruleValue;
        case '!=':
          return boolValue !== ruleValue;
        default:
          return false;
      }
    }

    // String comparison
    const strValue = String(fieldValue).toLowerCase();
    const strRule = String(ruleValue).toLowerCase();
    switch (operator) {
      case '==':
        return strValue === strRule;
      case '!=':
        return strValue !== strRule;
      default:
        return false;
    }
  }
}
