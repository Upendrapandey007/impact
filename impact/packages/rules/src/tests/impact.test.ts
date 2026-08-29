import { describe, expect, it } from 'vitest';
import { ImpactCalculator } from '../impact';
import { BASE_STUDENT } from './fixtures/base-student';
import type { Impact, RuleEvaluation } from '@impact/types';

const calculator = new ImpactCalculator();

describe('ImpactCalculator (Unit Tests)', () => {
  const currentEvals: RuleEvaluation[] = [
    {
      ruleId: 'R1',
      ruleCode: 'RULE-ENRL-001',
      ruleName: 'Full-time enrollment',
      ruleType: 'enrollment_status',
      passed: true,
      result: { status: 'full_time' },
      trace: { condition: { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 12 }, passed: true },
    },
  ];

  it('detects no changed impacts when rule outcomes match', () => {
    const hypoEvals: RuleEvaluation[] = [
      {
        ruleId: 'R1',
        ruleCode: 'RULE-ENRL-001',
        ruleName: 'Full-time enrollment',
        ruleType: 'enrollment_status',
        passed: true,
        result: { status: 'full_time' },
        trace: { condition: { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 12 }, passed: true },
      },
    ];

    const impacts = calculator.calculateDifferential(
      currentEvals,
      hypoEvals,
      BASE_STUDENT,
      BASE_STUDENT,
    );

    expect(impacts).toHaveLength(1);
    expect(impacts[0]!.changed).toBe(false);
    expect(impacts[0]!.severity).toBe('none');
  });

  it('detects changed impact when rule evaluation passes currently but fails hypothetically', () => {
    const hypoEvals: RuleEvaluation[] = [
      {
        ruleId: 'R1',
        ruleCode: 'RULE-ENRL-001',
        ruleName: 'Full-time enrollment',
        ruleType: 'enrollment_status',
        passed: false,
        result: { status: 'full_time' },
        trace: { condition: { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 12 }, passed: false },
      },
    ];

    const hypotheticalStudent = {
      ...BASE_STUDENT,
      creditsEnrolled: 9,
      enrollmentStatus: 'half_time' as const,
    };

    const impacts = calculator.calculateDifferential(
      currentEvals,
      hypoEvals,
      BASE_STUDENT,
      hypotheticalStudent,
    );

    expect(impacts).toHaveLength(1);
    expect(impacts[0]!.changed).toBe(true);
    expect(impacts[0]!.severity).not.toBe('none');
  });

  describe('generateRecommendedActions', () => {
    it('returns NO_ACTION_NEEDED when there are no changed impacts', () => {
      const actions = calculator.generateRecommendedActions([], BASE_STUDENT);
      expect(actions).toHaveLength(1);
      expect(actions[0]!.action).toBe('NO_ACTION_NEEDED');
    });

    it('recommends CONTACT_FINANCIAL_AID when there is a critical impact', () => {
      const impacts: Impact[] = [
        {
          category: 'financial_aid',
          severity: 'critical',
          changed: true,
          title: 'Pell loss',
          description: 'Loss of Pell',
          currentValue: {},
          projectedValue: {},
        },
      ];

      const actions = calculator.generateRecommendedActions(impacts, BASE_STUDENT);
      const hasAidAction = actions.some((a) => a.action === 'CONTACT_FINANCIAL_AID');
      expect(hasAidAction).toBe(true);
    });
  });
});
