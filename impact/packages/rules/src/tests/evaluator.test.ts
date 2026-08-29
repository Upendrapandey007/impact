import { describe, expect, it } from 'vitest';

import { ConditionEvaluator } from '../evaluator';
import { BASE_STUDENT } from './fixtures/base-student';

const evaluator = new ConditionEvaluator();

describe('ConditionEvaluator', () => {
  describe('field conditions', () => {
    it('correctly evaluates >= with a numeric field', () => {
      const result = evaluator.evaluate(
        { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 12 },
        BASE_STUDENT,
      );
      expect(result).toBe(true); // 15 >= 12 ✓
    });

    it('correctly evaluates < with a numeric field', () => {
      const result = evaluator.evaluate(
        { type: 'field', field: 'creditsEnrolled', operator: '<', value: 12 },
        BASE_STUDENT,
      );
      expect(result).toBe(false); // 15 < 12 ✗
    });

    it('evaluates == for enrollment status string', () => {
      const result = evaluator.evaluate(
        { type: 'field', field: 'enrollmentStatus', operator: '==', value: 'full_time' },
        BASE_STUDENT,
      );
      expect(result).toBe(true);
    });

    it('returns false for a missing/undefined field', () => {
      const result = evaluator.evaluate(
        { type: 'field', field: 'nonExistentField', operator: '==', value: 'x' },
        BASE_STUDENT,
      );
      expect(result).toBe(false);
    });

    it('resolves nested fields via dot notation', () => {
      const result = evaluator.evaluate(
        { type: 'field', field: 'program.code', operator: '==', value: 'CS' },
        BASE_STUDENT,
      );
      expect(result).toBe(true);
    });
  });

  describe('composite conditions', () => {
    it('AND: returns true only if all conditions pass', () => {
      const result = evaluator.evaluate(
        {
          type: 'and',
          conditions: [
            { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 15 },
            { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 3.0 },
          ],
        },
        BASE_STUDENT,
      );
      expect(result).toBe(true); // 15 >= 15 ✓ AND 3.18 >= 3.0 ✓
    });

    it('AND: returns false if any condition fails', () => {
      const result = evaluator.evaluate(
        {
          type: 'and',
          conditions: [
            { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 15 },
            { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 3.5 }, // 3.18 < 3.5
          ],
        },
        BASE_STUDENT,
      );
      expect(result).toBe(false);
    });

    it('OR: returns true if any condition passes', () => {
      const result = evaluator.evaluate(
        {
          type: 'or',
          conditions: [
            { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 20 }, // fails
            { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 3.0 }, // passes
          ],
        },
        BASE_STUDENT,
      );
      expect(result).toBe(true);
    });

    it('OR: returns false if all conditions fail', () => {
      const result = evaluator.evaluate(
        {
          type: 'or',
          conditions: [
            { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 20 },
            { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 4.0 },
          ],
        },
        BASE_STUDENT,
      );
      expect(result).toBe(false);
    });

    it('NOT: inverts a passing condition', () => {
      const result = evaluator.evaluate(
        {
          type: 'not',
          condition: { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 12 },
        },
        BASE_STUDENT,
      );
      expect(result).toBe(false); // NOT (15 >= 12) → NOT true → false
    });

    it('NOT: inverts a failing condition', () => {
      const result = evaluator.evaluate(
        {
          type: 'not',
          condition: { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 20 },
        },
        BASE_STUDENT,
      );
      expect(result).toBe(true); // NOT (15 >= 20) → NOT false → true
    });
  });

  describe('trace', () => {
    it('produces a complete trace with fieldValue', () => {
      const trace = evaluator.evaluateWithTrace(
        { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 12 },
        BASE_STUDENT,
      );
      expect(trace.passed).toBe(true);
      expect(trace.fieldValue).toBe(15);
    });

    it('produces child traces for AND conditions', () => {
      const trace = evaluator.evaluateWithTrace(
        {
          type: 'and',
          conditions: [
            { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 15 },
            { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 3.0 },
          ],
        },
        BASE_STUDENT,
      );
      expect(trace.children).toHaveLength(2);
      expect(trace.children![0]!.passed).toBe(true);
      expect(trace.children![1]!.passed).toBe(true);
    });
  });
});
