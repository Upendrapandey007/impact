import type { RuleDefinition } from '../../engine';

/**
 * Standard rule set used in golden tests.
 * Represents a typical institution's rule configuration.
 */
export const SAMPLE_RULES: RuleDefinition[] = [
  // ─── Enrollment Status Rules ──────────────────────────────────────────────

  {
    id: 'RULE-ENRL-001',
    ruleCode: 'RULE-ENRL-001',
    type: 'enrollment_status',
    name: 'Full-time enrollment (≥12 credits)',
    priority: 10,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'field',
      field: 'creditsEnrolled',
      operator: '>=',
      value: 12,
    },
    result: { status: 'full_time' },
    policyVersionId: 'PV-001',
  },

  {
    id: 'RULE-ENRL-002',
    ruleCode: 'RULE-ENRL-002',
    type: 'enrollment_status',
    name: 'Half-time enrollment (6–11 credits)',
    priority: 20,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'and',
      conditions: [
        { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 6 },
        { type: 'field', field: 'creditsEnrolled', operator: '<', value: 12 },
      ],
    },
    result: { status: 'half_time' },
    policyVersionId: 'PV-001',
  },

  // ─── Scholarship Eligibility Rules ────────────────────────────────────────

  {
    id: 'RULE-SCH-001',
    ruleCode: 'RULE-SCH-001',
    type: 'scholarship_eligibility',
    name: 'University Merit Scholarship — minimum 15 credits',
    priority: 30,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'and',
      conditions: [
        { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 15 },
        { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 3.0 },
      ],
    },
    result: { eligible: true, scholarshipId: 'SCH_001', amount: 2500 },
    policyVersionId: 'PV-002',
  },

  // ─── Pell Grant Eligibility Rules ─────────────────────────────────────────

  {
    id: 'RULE-PELL-001',
    ruleCode: 'RULE-PELL-001',
    type: 'aid_eligibility',
    name: 'Pell Grant — minimum half-time enrollment',
    priority: 40,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'field',
      field: 'creditsEnrolled',
      operator: '>=',
      value: 6,
    },
    result: { eligible: true, aidType: 'PELL' },
    policyVersionId: 'PV-001',
  },

  // ─── SAP Quantitative (Pace Rate) ─────────────────────────────────────────

  {
    id: 'RULE-SAP-001',
    ruleCode: 'RULE-SAP-001',
    type: 'sap_quantitative',
    name: 'SAP pace rate — must complete ≥67% of attempted credits',
    priority: 50,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'field',
      field: 'sapPaceRate',
      operator: '>=',
      value: 0.67,
    },
    result: { sapQuantitative: 'satisfactory' },
    policyVersionId: 'PV-001',
  },

  // ─── SAP Qualitative (GPA) ────────────────────────────────────────────────

  {
    id: 'RULE-SAP-002',
    ruleCode: 'RULE-SAP-002',
    type: 'sap_qualitative',
    name: 'SAP qualitative — minimum 2.0 cumulative GPA',
    priority: 60,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'field',
      field: 'cumulativeGpa',
      operator: '>=',
      value: 2.0,
    },
    result: { sapQualitative: 'satisfactory' },
    policyVersionId: 'PV-001',
  },

  // ─── SAP Timeframe ────────────────────────────────────────────────────────

  {
    id: 'RULE-SAP-003',
    ruleCode: 'RULE-SAP-003',
    type: 'sap_timeframe',
    name: 'SAP timeframe — must not exceed 150% of program length',
    priority: 70,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'field',
      field: 'sapTimeframeUsed',
      operator: '<=',
      value: 1.0,
    },
    result: { sapTimeframe: 'within_limit' },
    policyVersionId: 'PV-001',
  },

  // ─── GPA Requirement ──────────────────────────────────────────────────────

  {
    id: 'RULE-GPA-001',
    ruleCode: 'RULE-GPA-001',
    type: 'gpa_requirement',
    name: 'Good academic standing — minimum 2.0 GPA',
    priority: 80,
    status: 'active',
    effectiveFrom: '2026-08-01',
    condition: {
      type: 'field',
      field: 'cumulativeGpa',
      operator: '>=',
      value: 2.0,
    },
    result: { standing: 'good' },
    policyVersionId: 'PV-003',
  },
];
