import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  inet,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'student',
  'advisor',
  'financial_aid_officer',
  'admin',
  'super_admin',
]);

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'full_time',
  'half_time',
  'less_than_half_time',
  'withdrawn',
  'graduated',
]);

export const studentLevelEnum = pgEnum('student_level', [
  'freshman',
  'sophomore',
  'junior',
  'senior',
  'graduate',
  'non_degree',
]);

export const academicStandingEnum = pgEnum('academic_standing', [
  'good',
  'probation',
  'suspension',
  'dismissed',
]);

export const sapStatusEnum = pgEnum('sap_status', [
  'satisfactory',
  'warning',
  'probation',
  'suspension',
  'plan',
]);

export const courseEnrollmentStatusEnum = pgEnum('course_enrollment_status', [
  'enrolled',
  'dropped',
  'withdrawn',
  'completed',
  'failed',
  'incomplete',
  'audit',
]);

export const aidTypeEnum = pgEnum('aid_type', [
  'PELL',
  'LOAN_SUB',
  'LOAN_UNSUB',
  'SCHOLARSHIP',
  'GRANT',
  'WORK_STUDY',
  'PLUS',
  'STATE',
  'INSTITUTIONAL',
]);

export const aidStatusEnum = pgEnum('aid_status', [
  'offered',
  'accepted',
  'disbursed',
  'cancelled',
  'reduced',
]);

export const policyTypeEnum = pgEnum('policy_type', [
  'financial_aid',
  'sap',
  'scholarship',
  'enrollment',
  'academic',
  'program',
  'veteran',
  'international',
  'department',
]);

export const policyVersionStatusEnum = pgEnum('policy_version_status', [
  'draft',
  'processing',
  'active',
  'superseded',
  'archived',
]);

export const ruleTypeEnum = pgEnum('rule_type', [
  'enrollment_status',
  'scholarship_eligibility',
  'sap_quantitative',
  'sap_qualitative',
  'sap_timeframe',
  'aid_eligibility',
  'graduation_requirement',
  'credit_requirement',
  'gpa_requirement',
]);

export const ruleStatusEnum = pgEnum('rule_status', [
  'draft',
  'pending_review',
  'active',
  'deprecated',
]);

export const scenarioTypeEnum = pgEnum('scenario_type', [
  'DROP_COURSE',
  'WITHDRAW',
  'CHANGE_MAJOR',
  'REDUCE_CREDITS',
  'REPEAT_COURSE',
  'FAIL_COURSE',
  'ADD_COURSE',
  'LEAVE_OF_ABSENCE',
  'GRADUATE_EARLY',
  'DELAY_GRADUATION',
  'TRANSFER',
  'OTHER',
]);

export const riskLevelEnum = pgEnum('risk_level', ['low', 'moderate', 'high', 'critical']);

export const impactCategoryEnum = pgEnum('impact_category', [
  'financial_aid',
  'scholarship',
  'sap',
  'enrollment_status',
  'graduation',
  'gpa',
  'compliance',
  'administrative',
]);

export const impactSeverityEnum = pgEnum('impact_severity', [
  'none',
  'low',
  'moderate',
  'high',
  'critical',
]);

export const appealStatusEnum = pgEnum('appeal_status', [
  'draft',
  'submitted',
  'under_review',
  'pending_docs',
  'approved',
  'denied',
  'withdrawn',
]);

export const simulationStatusEnum = pgEnum('simulation_status', [
  'pending',
  'running',
  'completed',
  'failed',
]);

export const importJobStatusEnum = pgEnum('import_job_status', [
  'queued',
  'processing',
  'completed',
  'failed',
  'partial',
]);

export const integrationTypeEnum = pgEnum('integration_type', [
  'csv',
  'banner',
  'workday',
  'peoplesoft',
  'colleague',
  'custom',
]);

export const opportunityTypeEnum = pgEnum('opportunity_type', [
  'scholarship',
  'student_job',
  'work_study',
  'grant',
  'emergency_aid',
  'fellowship',
  'internship',
]);

export const opportunityStatusEnum = pgEnum('opportunity_status', [
  'active',
  'expired',
  'pending_verification',
  'archived',
]);

export const opportunitySourceTypeEnum = pgEnum('opportunity_source_type', [
  'rss',
  'sitemap',
  'public_api',
  'html_scraper',
]);

// ─── Institutions ─────────────────────────────────────────────────────────────

export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain'),
  settings: jsonb('settings').default({}).notNull(),
  branding: jsonb('branding').default({}).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    externalId: text('external_id'),
    email: text('email').notNull(),
    name: text('name').notNull(),
    role: userRoleEnum('role').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_users_institution').on(table.institutionId),
    index('idx_users_role').on(table.institutionId, table.role),
    unique('uq_users_institution_email').on(table.institutionId, table.email),
  ],
);

// ─── Programs ─────────────────────────────────────────────────────────────────

export const programs = pgTable(
  'programs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    code: text('code').notNull(),
    name: text('name').notNull(),
    degreeType: text('degree_type'),
    totalCredits: integer('total_credits'),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('uq_programs_institution_code').on(table.institutionId, table.code)],
);

// ─── Students ─────────────────────────────────────────────────────────────────

export const students = pgTable(
  'students',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    userId: uuid('user_id').references(() => users.id),
    studentNumber: text('student_number').notNull(),
    programId: uuid('program_id').references(() => programs.id),
    level: studentLevelEnum('level'),
    enrollmentStatus: enrollmentStatusEnum('enrollment_status'),
    expectedGraduation: date('expected_graduation'),
    advisorId: uuid('advisor_id').references(() => users.id),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_students_institution').on(table.institutionId),
    index('idx_students_advisor').on(table.advisorId),
    unique('uq_students_institution_number').on(table.institutionId, table.studentNumber),
  ],
);

// ─── Terms ────────────────────────────────────────────────────────────────────

export const terms = pgTable(
  'terms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    code: text('code').notNull(),
    name: text('name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    addDeadline: date('add_deadline'),
    dropDeadline: date('drop_deadline'),
    withdrawalDeadline: date('withdrawal_deadline'),
    isCurrent: boolean('is_current').default(false).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
  },
  (table) => [unique('uq_terms_institution_code').on(table.institutionId, table.code)],
);

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    code: text('code').notNull(),
    title: text('title').notNull(),
    credits: numeric('credits', { precision: 4, scale: 2 }).notNull(),
    department: text('department'),
    isRepeatable: boolean('is_repeatable').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
  },
  (table) => [unique('uq_courses_institution_code').on(table.institutionId, table.code)],
);

// ─── Enrollments ──────────────────────────────────────────────────────────────

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id),
    termId: uuid('term_id')
      .notNull()
      .references(() => terms.id),
    status: courseEnrollmentStatusEnum('status').notNull(),
    grade: text('grade'),
    gradePoints: numeric('grade_points', { precision: 4, scale: 2 }),
    creditsAttempted: numeric('credits_attempted', { precision: 4, scale: 2 }),
    creditsEarned: numeric('credits_earned', { precision: 4, scale: 2 }),
    isRepeated: boolean('is_repeated').default(false).notNull(),
    droppedAt: timestamp('dropped_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_enrollments_student').on(table.studentId),
    index('idx_enrollments_term').on(table.termId),
  ],
);

// ─── Academic Records ─────────────────────────────────────────────────────────

export const academicRecords = pgTable(
  'academic_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    termId: uuid('term_id')
      .notNull()
      .references(() => terms.id),
    termGpa: numeric('term_gpa', { precision: 4, scale: 3 }),
    cumulativeGpa: numeric('cumulative_gpa', { precision: 4, scale: 3 }),
    creditsAttempted: numeric('credits_attempted', { precision: 6, scale: 2 }),
    creditsEarned: numeric('credits_earned', { precision: 6, scale: 2 }),
    creditsEnrolled: numeric('credits_enrolled', { precision: 6, scale: 2 }),
    totalCreditsCompleted: numeric('total_credits_completed', { precision: 6, scale: 2 }),
    standing: academicStandingEnum('standing'),
    snapshotAt: timestamp('snapshot_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('uq_academic_records_student_term').on(table.studentId, table.termId)],
);

// ─── Financial Aid Awards ─────────────────────────────────────────────────────

export const financialAidAwards = pgTable(
  'financial_aid_awards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    termId: uuid('term_id')
      .notNull()
      .references(() => terms.id),
    aidType: aidTypeEnum('aid_type').notNull(),
    source: text('source'),
    name: text('name').notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    status: aidStatusEnum('status'),
    conditions: jsonb('conditions').default([]).notNull(),
    disbursedAt: timestamp('disbursed_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_fa_awards_student').on(table.studentId, table.termId)],
);

// ─── Scholarships ─────────────────────────────────────────────────────────────

export const scholarships = pgTable('scholarships', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  name: text('name').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }),
  renewable: boolean('renewable').default(true).notNull(),
  conditions: jsonb('conditions').default([]).notNull(),
  policyId: uuid('policy_id'),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── SAP Records ─────────────────────────────────────────────────────────────

export const sapRecords = pgTable(
  'sap_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    termId: uuid('term_id')
      .notNull()
      .references(() => terms.id),
    status: sapStatusEnum('status').notNull(),
    paceRate: numeric('pace_rate', { precision: 5, scale: 4 }),
    maxTimeframePct: numeric('max_timeframe_pct', { precision: 5, scale: 4 }),
    qualitativeGpa: numeric('qualitative_gpa', { precision: 4, scale: 3 }),
    isAppealApproved: boolean('is_appeal_approved').default(false).notNull(),
    notes: text('notes'),
    evaluatedAt: timestamp('evaluated_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('uq_sap_records_student_term').on(table.studentId, table.termId)],
);

// ─── Policies ─────────────────────────────────────────────────────────────────

export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  name: text('name').notNull(),
  type: policyTypeEnum('type').notNull(),
  description: text('description'),
  ownerOffice: text('owner_office'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Policy Versions ──────────────────────────────────────────────────────────

export const policyVersions = pgTable(
  'policy_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    policyId: uuid('policy_id')
      .notNull()
      .references(() => policies.id),
    versionLabel: text('version_label').notNull(),
    effectiveFrom: date('effective_from').notNull(),
    effectiveTo: date('effective_to'),
    documentUrl: text('document_url'),
    documentHash: text('document_hash'),
    status: policyVersionStatusEnum('status'),
    processingLog: jsonb('processing_log').default([]).notNull(),
    uploadedBy: uuid('uploaded_by').references(() => users.id),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_policy_versions_policy').on(table.policyId, table.effectiveFrom)],
);

// ─── Policy Chunks ────────────────────────────────────────────────────────────
// Note: embedding column uses pgvector extension — must be enabled separately
// via: CREATE EXTENSION IF NOT EXISTS vector;
// The vector column is defined as text here and migrated manually or via raw SQL
// until drizzle-orm adds native pgvector support.

export const policyChunks = pgTable(
  'policy_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    policyVersionId: uuid('policy_version_id')
      .notNull()
      .references(() => policyVersions.id),
    chunkIndex: integer('chunk_index').notNull(),
    text: text('text').notNull(),
    // embedding: vector(1536) — added via raw migration (pgvector)
    chunkMetadata: jsonb('chunk_metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_policy_chunks_version').on(table.policyVersionId)],
);

// ─── Rules ────────────────────────────────────────────────────────────────────

export const rules = pgTable(
  'rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    ruleCode: text('rule_code').notNull(),
    policyVersionId: uuid('policy_version_id').references(() => policyVersions.id),
    type: ruleTypeEnum('type').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    conditionJson: jsonb('condition_json').notNull(),
    resultJson: jsonb('result_json').notNull(),
    priority: integer('priority').default(100).notNull(),
    status: ruleStatusEnum('status'),
    effectiveFrom: date('effective_from'),
    effectiveTo: date('effective_to'),
    version: integer('version').default(1).notNull(),
    createdBy: uuid('created_by').references(() => users.id),
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_rules_institution').on(table.institutionId, table.status, table.type),
    unique('uq_rules_institution_code_version').on(
      table.institutionId,
      table.ruleCode,
      table.version,
    ),
  ],
);

// ─── Scenarios ────────────────────────────────────────────────────────────────

export const scenarios = pgTable(
  'scenarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    initiatedBy: uuid('initiated_by')
      .notNull()
      .references(() => users.id),
    type: scenarioTypeEnum('type').notNull(),
    parameters: jsonb('parameters').notNull(),
    currentState: jsonb('current_state').notNull(),
    hypotheticalState: jsonb('hypothetical_state').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_scenarios_student').on(table.studentId, table.createdAt)],
);

// ─── Simulations ──────────────────────────────────────────────────────────────

export const simulations = pgTable(
  'simulations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    scenarioId: uuid('scenario_id')
      .notNull()
      .references(() => scenarios.id),
    status: simulationStatusEnum('status'),
    overallRisk: riskLevelEnum('overall_risk'),
    riskScores: jsonb('risk_scores').default({}).notNull(),
    policyVersionIds: jsonb('policy_version_ids').default([]).notNull(),
    ruleIds: jsonb('rule_ids').default([]).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_simulations_student').on(table.studentId, table.createdAt)],
);

// ─── Impacts ──────────────────────────────────────────────────────────────────

export const impacts = pgTable('impacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  simulationId: uuid('simulation_id')
    .notNull()
    .references(() => simulations.id),
  category: impactCategoryEnum('category').notNull(),
  severity: impactSeverityEnum('severity').notNull(),
  changed: boolean('changed').default(true).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  currentValue: jsonb('current_value'),
  projectedValue: jsonb('projected_value'),
  ruleId: uuid('rule_id').references(() => rules.id),
  policyVersionId: uuid('policy_version_id').references(() => policyVersions.id),
  policyChunkId: uuid('policy_chunk_id').references(() => policyChunks.id),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Risk Assessments ─────────────────────────────────────────────────────────

export const riskAssessments = pgTable(
  'risk_assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    simulationId: uuid('simulation_id').references(() => simulations.id),
    assessedAt: timestamp('assessed_at', { withTimezone: true }).defaultNow().notNull(),
    overallRisk: riskLevelEnum('overall_risk'),
    financialRisk: riskLevelEnum('financial_risk'),
    academicRisk: riskLevelEnum('academic_risk'),
    graduationRisk: riskLevelEnum('graduation_risk'),
    complianceRisk: riskLevelEnum('compliance_risk'),
    isAdvisorOverride: boolean('is_advisor_override').default(false).notNull(),
    overrideBy: uuid('override_by').references(() => users.id),
    overrideReason: text('override_reason'),
    overrideAt: timestamp('override_at', { withTimezone: true }),
  },
  (table) => [index('idx_risk_student').on(table.studentId, table.assessedAt)],
);

// ─── Advisor Notes ────────────────────────────────────────────────────────────

export const advisorNotes = pgTable('advisor_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id),
  advisorId: uuid('advisor_id')
    .notNull()
    .references(() => users.id),
  simulationId: uuid('simulation_id').references(() => simulations.id),
  content: text('content').notNull(),
  isInternal: boolean('is_internal').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Appeals ──────────────────────────────────────────────────────────────────

export const appeals = pgTable('appeals', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id),
  simulationId: uuid('simulation_id').references(() => simulations.id),
  type: text('type').notNull(),
  status: appealStatusEnum('status'),
  reasonCategory: text('reason_category'),
  reasonText: text('reason_text'),
  aiDraft: text('ai_draft'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  decisionNotes: text('decision_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Appeal Documents ─────────────────────────────────────────────────────────

export const appealDocuments = pgTable('appeal_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  appealId: uuid('appeal_id')
    .notNull()
    .references(() => appeals.id),
  name: text('name').notNull(),
  documentUrl: text('document_url').notNull(),
  documentType: text('document_type'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    link: text('link'),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_notifications_user').on(table.userId, table.isRead, table.createdAt)],
);

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    actorId: uuid('actor_id').references(() => users.id),
    actorRole: text('actor_role'),
    action: text('action').notNull(),
    resourceType: text('resource_type'),
    resourceId: uuid('resource_id'),
    beforeState: jsonb('before_state'),
    afterState: jsonb('after_state'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_institution').on(table.institutionId, table.createdAt),
    index('idx_audit_actor').on(table.actorId, table.createdAt),
  ],
);

// ─── Integrations ─────────────────────────────────────────────────────────────

export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  type: integrationTypeEnum('type').notNull(),
  name: text('name').notNull(),
  config: jsonb('config').default({}).notNull(),
  status: text('status'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  lastSyncStatus: text('last_sync_status'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Import Jobs ──────────────────────────────────────────────────────────────

export const importJobs = pgTable('import_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  integrationId: uuid('integration_id').references(() => integrations.id),
  type: text('type').notNull(),
  fileUrl: text('file_url'),
  status: importJobStatusEnum('status'),
  totalRecords: integer('total_records'),
  processedRecords: integer('processed_records').default(0).notNull(),
  errorRecords: integer('error_records').default(0).notNull(),
  errors: jsonb('errors').default([]).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Opportunity Sources (Web Scraping Feeds & Endpoints) ────────────────────

export const opportunitySources = pgTable('opportunity_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id), // Nullable for global feeds
  name: text('name').notNull(),
  sourceType: opportunitySourceTypeEnum('source_type').notNull(),
  targetUrl: text('target_url').notNull(),
  robotsPolicyUrl: text('robots_policy_url'),
  rateLimitPerMin: integer('rate_limit_per_min').default(30).notNull(),
  scrapeConfig: jsonb('scrape_config').default({}).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
  lastScrapeStatus: text('last_scrape_status'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Opportunities (Legally Scraped & Verified Scholarships, Jobs, Grants) ────

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    institutionId: uuid('institution_id').references(() => institutions.id),
    sourceId: uuid('source_id').references(() => opportunitySources.id),
    type: opportunityTypeEnum('type').notNull(),
    title: text('title').notNull(),
    provider: text('provider').notNull(),
    description: text('description').notNull(),
    amountOrWage: text('amount_or_wage'),
    amountNumeric: numeric('amount_numeric', { precision: 10, scale: 2 }),
    applicationDeadline: date('application_deadline'),
    sourceUrl: text('source_url').notNull(),
    sourceDomain: text('source_domain').notNull(),
    contentHash: text('content_hash').notNull().unique(), // Deduplication key
    isVerified: boolean('is_verified').default(false).notNull(),
    status: opportunityStatusEnum('status').default('active').notNull(),
    eligibilityCriteria: jsonb('eligibility_criteria').default({}).notNull(),
    tags: jsonb('tags').default([]).notNull(),
    lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_opportunities_type').on(table.type, table.status),
    index('idx_opportunities_institution').on(table.institutionId),
    index('idx_opportunities_deadline').on(table.applicationDeadline),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const studentsRelations = relations(students, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [students.institutionId],
    references: [institutions.id],
  }),
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [students.programId],
    references: [programs.id],
  }),
  advisor: one(users, {
    fields: [students.advisorId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
  academicRecords: many(academicRecords),
  financialAidAwards: many(financialAidAwards),
  sapRecords: many(sapRecords),
  simulations: many(simulations),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  term: one(terms, {
    fields: [enrollments.termId],
    references: [terms.id],
  }),
}));

export const simulationsRelations = relations(simulations, ({ one, many }) => ({
  student: one(students, {
    fields: [simulations.studentId],
    references: [students.id],
  }),
  scenario: one(scenarios, {
    fields: [simulations.scenarioId],
    references: [scenarios.id],
  }),
  impacts: many(impacts),
}));

export const impactsRelations = relations(impacts, ({ one }) => ({
  simulation: one(simulations, {
    fields: [impacts.simulationId],
    references: [simulations.id],
  }),
  rule: one(rules, {
    fields: [impacts.ruleId],
    references: [rules.id],
  }),
  policyVersion: one(policyVersions, {
    fields: [impacts.policyVersionId],
    references: [policyVersions.id],
  }),
}));

export const policyVersionsRelations = relations(policyVersions, ({ one, many }) => ({
  policy: one(policies, {
    fields: [policyVersions.policyId],
    references: [policies.id],
  }),
  rules: many(rules),
}));
