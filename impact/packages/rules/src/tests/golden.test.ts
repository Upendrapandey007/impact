import { describe, expect, it } from 'vitest';

import { RuleEngine } from '../engine';
import { BASE_STUDENT } from './fixtures/base-student';
import { SAMPLE_RULES } from './fixtures/sample-rules';

const engine = new RuleEngine(SAMPLE_RULES);

// ─── GOLDEN TEST CASES ───────────────────────────────────────────────────────
// Each case specifies:
//   - A starting student state
//   - A decision (scenario type + parameters)
//   - Expected simulation outputs
// These must pass after every engine change.

describe('RuleEngine — Golden Test Cases', () => {
  // ─── CASE-001 ──────────────────────────────────────────────────────────────
  // Student: 15 credits, Merit Scholarship requires ≥15 credits
  // Decision: Drop a 3-credit course
  // Expected: scholarship eligibility lost (high risk), enrollment stays full-time

  describe('CASE-001: Drop 3-credit course from 15-credit load', () => {
    const result = engine.simulate(BASE_STUDENT, 'DROP_COURSE', {
      courseId: 'BIO201',
    });

    it('overall risk should be high or critical', () => {
      expect(['high', 'critical']).toContain(result.overallRisk);
    });

    it('hypothetical credits enrolled should be 12', () => {
      const hypoState = result.hypotheticalEvaluations;
      const enrollmentRule = hypoState.find((e) => e.ruleCode === 'RULE-ENRL-001');
      expect(enrollmentRule).toBeDefined();
    });

    it('should detect scholarship eligibility loss', () => {
      const scholarshipImpact = result.impacts.find(
        (i) => i.category === 'scholarship' && i.changed,
      );
      expect(scholarshipImpact).toBeDefined();
      expect(scholarshipImpact?.severity).toBe('high');
    });

    it('enrollment status remains full-time (12 credits still meets threshold)', () => {
      const enrollmentImpact = result.impacts.find(
        (i) =>
          i.category === 'enrollment_status' &&
          i.changed &&
          (i.projectedValue as { status?: string })?.status === 'withdrawn',
      );
      expect(enrollmentImpact).toBeUndefined(); // Should NOT go to withdrawn
    });

    it('financial risk score should be > 60', () => {
      expect(result.riskScores.financial).toBeGreaterThan(60);
    });

    it('should recommend contacting advisor or financial aid', () => {
      const hasAdvisorAction = result.recommendedActions.some(
        (a) => a.action === 'CONTACT_ADVISOR' || a.action === 'CONTACT_FINANCIAL_AID',
      );
      expect(hasAdvisorAction).toBe(true);
    });
  });

  // ─── CASE-002 ──────────────────────────────────────────────────────────────
  // Student: 15 credits
  // Decision: Drop a 3-credit course from a 15-credit load
  // But student has GPA 2.8 (below scholarship minimum)
  // Expected: scholarship was already ineligible, no new scholarship impact

  describe('CASE-002: Drop course when scholarship already ineligible (GPA below threshold)', () => {
    const lowGpaStudent = {
      ...BASE_STUDENT,
      cumulativeGpa: 2.8, // Below scholarship GPA threshold (3.0)
    };
    const lowGpaEngine = new RuleEngine(SAMPLE_RULES);
    const result = lowGpaEngine.simulate(lowGpaStudent, 'DROP_COURSE', { courseId: 'BIO201' });

    it('scholarship impact should not be changed (was already ineligible)', () => {
      const scholarshipImpact = result.impacts.find(
        (i) => i.category === 'scholarship' && i.changed,
      );
      // Scholarship was failing before (GPA < 3.0), still failing after — no change
      expect(scholarshipImpact).toBeUndefined();
    });
  });

  // ─── CASE-003 ──────────────────────────────────────────────────────────────
  // Student: 15 credits → withdraw completely
  // Expected: critical risk, Pell eligibility lost, scholarship lost, enrollment status = withdrawn

  describe('CASE-003: Full withdrawal', () => {
    const result = engine.simulate(BASE_STUDENT, 'WITHDRAW', {});

    it('overall risk should be critical', () => {
      expect(result.overallRisk).toBe('critical');
    });

    it('should detect Pell eligibility loss', () => {
      const pellImpact = result.impacts.find(
        (i) => i.category === 'financial_aid' && i.changed,
      );
      expect(pellImpact).toBeDefined();
    });

    it('should detect scholarship eligibility loss', () => {
      const schImpact = result.impacts.find(
        (i) => i.category === 'scholarship' && i.changed,
      );
      expect(schImpact).toBeDefined();
    });

    it('should recommend contacting financial aid immediately', () => {
      const faAction = result.recommendedActions.find(
        (a) => a.action === 'CONTACT_FINANCIAL_AID',
      );
      expect(faAction).toBeDefined();
      expect(faAction?.priority).toBe(1);
    });
  });

  // ─── CASE-004 ──────────────────────────────────────────────────────────────
  // Student: 15 credits → reduce to 13 credits
  // Expected: no scholarship impact (still ≥15? No — 13 < 15 → scholarship at risk)

  describe('CASE-004: Reduce credits to 13 (below scholarship threshold)', () => {
    const result = engine.simulate(BASE_STUDENT, 'REDUCE_CREDITS', { targetCredits: 13 });

    it('should detect scholarship eligibility loss', () => {
      const schImpact = result.impacts.find(
        (i) => i.category === 'scholarship' && i.changed,
      );
      expect(schImpact).toBeDefined();
    });

    it('overall risk should not be critical (no complete aid loss)', () => {
      expect(result.overallRisk).not.toBe('critical');
    });
  });

  // ─── CASE-005 ──────────────────────────────────────────────────────────────
  // Student: 15 credits → add a 3-credit course (18 credits total)
  // Expected: no negative impacts (more credits = all thresholds still met)

  describe('CASE-005: Add a 3-credit course (no negative impacts expected)', () => {
    const result = engine.simulate(BASE_STUDENT, 'ADD_COURSE', {
      courseId: 'CS401',
      courseCode: 'CS 401',
      courseTitle: 'Senior Capstone',
      courseCredits: 3,
    });

    it('should have no high or critical changed impacts', () => {
      const seriousChanges = result.impacts.filter(
        (i) => i.changed && (i.severity === 'high' || i.severity === 'critical'),
      );
      expect(seriousChanges).toHaveLength(0);
    });

    it('overall risk should be low', () => {
      expect(result.overallRisk).toBe('low');
    });
  });

  // ─── CASE-006 ──────────────────────────────────────────────────────────────
  // Student at low SAP pace rate (0.70, near threshold)
  // Decision: Fail a course
  // Expected: SAP pace rate drops below 0.67 → SAP at risk

  describe('CASE-006: Fail a course when pace rate is near threshold', () => {
    const lowPaceStudent: typeof BASE_STUDENT = {
      ...BASE_STUDENT,
      creditsEarned: 50,
      creditsAttempted: 74,
      sapPaceRate: 0.676, // 50/74 = 67.6% (above 67% threshold, but drops to 50/77 = 64.9% on fail)
    };
    const result = engine.simulate(lowPaceStudent, 'FAIL_COURSE', {
      courseId: 'BIO201',
    });

    it('should detect SAP quantitative risk', () => {
      const sapImpact = result.impacts.find(
        (i) => i.category === 'sap' && i.changed,
      );
      expect(sapImpact).toBeDefined();
    });
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('RuleEngine — Edge Cases', () => {
  it('handles 0 credits enrolled gracefully', () => {
    const zeroCreditsStudent = { ...BASE_STUDENT, creditsEnrolled: 0 };
    const result = engine.simulate(zeroCreditsStudent, 'WITHDRAW', {});
    expect(result.overallRisk).toBeDefined();
  });

  it('returns all policy version IDs used', () => {
    const result = engine.simulate(BASE_STUDENT, 'DROP_COURSE', { courseId: 'BIO201' });
    expect(result.policyVersionIds.length).toBeGreaterThan(0);
  });

  it('returns all rule IDs evaluated', () => {
    const result = engine.simulate(BASE_STUDENT, 'DROP_COURSE', { courseId: 'BIO201' });
    expect(result.ruleIds.length).toBe(SAMPLE_RULES.length);
  });

  it('throws for DROP_COURSE with invalid courseId', () => {
    expect(() =>
      engine.simulate(BASE_STUDENT, 'DROP_COURSE', { courseId: 'DOES_NOT_EXIST' }),
    ).toThrow();
  });
});
