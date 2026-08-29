import { describe, expect, it } from 'vitest';
import { RulesService } from './rules.service';

const MOCK_STUDENT: any = {
  studentId: 'STU-001',
  institutionId: 'inst-1',
  creditsEnrolled: 15,
  cumulativeGpa: 3.2,
  sapPaceRate: 0.95,
  enrollments: [],
  aidAwards: [],
  scholarships: [],
  program: { code: 'CS', name: 'Computer Science' },
};

describe('RulesService (Unit Tests)', () => {
  const mockDb = {
    query: {
      rules: {
        findFirst: () =>
          Promise.resolve({
            id: 'rule-1',
            ruleCode: 'RULE-ENRL-001',
            name: 'Full-time enrollment',
            type: 'enrollment_status',
            conditionJson: {
              type: 'field',
              field: 'creditsEnrolled',
              operator: '>=',
              value: 12,
            },
            resultJson: { status: 'full_time' },
          }),
      },
    },
  } as any;

  const mockSimulationsService = {} as any;
  const service = new RulesService(mockDb, mockSimulationsService);

  describe('testRule (Admin Test Harness)', () => {
    it('evaluates rule condition and produces trace against provided student state', async () => {
      const result = await service.testRule(
        'rule-1',
        { studentState: MOCK_STUDENT },
        { institutionId: 'inst-1' } as any,
      );

      expect(result.ruleCode).toBe('RULE-ENRL-001');
      expect(result.passed).toBe(true); // MOCK_STUDENT has 15 credits >= 12
      expect(result.evaluationTrace.passed).toBe(true);
      expect(result.evaluationTrace.fieldValue).toBe(15);
    });

    it('evaluates rule condition as false when student does not meet condition', async () => {
      const lowCreditStudent = {
        ...MOCK_STUDENT,
        creditsEnrolled: 6,
      };

      const result = await service.testRule(
        'rule-1',
        { studentState: lowCreditStudent },
        { institutionId: 'inst-1' } as any,
      );

      expect(result.passed).toBe(false); // 6 < 12
      expect(result.evaluationTrace.passed).toBe(false);
    });
  });
});
