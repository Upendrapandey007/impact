// ─── Shared enums / literals ──────────────────────────────────────────────────

export type UserRole =
  | 'student'
  | 'advisor'
  | 'financial_aid_officer'
  | 'admin'
  | 'super_admin';

export type EnrollmentStatus =
  | 'full_time'
  | 'half_time'
  | 'less_than_half_time'
  | 'withdrawn'
  | 'graduated';

export type StudentLevel =
  | 'freshman'
  | 'sophomore'
  | 'junior'
  | 'senior'
  | 'graduate'
  | 'non_degree';

export type AcademicStanding = 'good' | 'probation' | 'suspension' | 'dismissed';

export type SAPStatus = 'satisfactory' | 'warning' | 'probation' | 'suspension' | 'plan';

export type CourseEnrollmentStatus =
  | 'enrolled'
  | 'dropped'
  | 'withdrawn'
  | 'completed'
  | 'failed'
  | 'incomplete'
  | 'audit';

export type AidType =
  | 'PELL'
  | 'LOAN_SUB'
  | 'LOAN_UNSUB'
  | 'SCHOLARSHIP'
  | 'GRANT'
  | 'WORK_STUDY'
  | 'PLUS'
  | 'STATE'
  | 'INSTITUTIONAL';

export type AidStatus = 'offered' | 'accepted' | 'disbursed' | 'cancelled' | 'reduced';

export type PolicyType =
  | 'financial_aid'
  | 'sap'
  | 'scholarship'
  | 'enrollment'
  | 'academic'
  | 'program'
  | 'veteran'
  | 'international'
  | 'department';

export type PolicyVersionStatus =
  | 'draft'
  | 'processing'
  | 'active'
  | 'superseded'
  | 'archived';

export type RuleType =
  | 'enrollment_status'
  | 'scholarship_eligibility'
  | 'sap_quantitative'
  | 'sap_qualitative'
  | 'sap_timeframe'
  | 'aid_eligibility'
  | 'graduation_requirement'
  | 'credit_requirement'
  | 'gpa_requirement';

export type RuleStatus = 'draft' | 'pending_review' | 'active' | 'deprecated';

export type ScenarioType =
  | 'DROP_COURSE'
  | 'WITHDRAW'
  | 'CHANGE_MAJOR'
  | 'REDUCE_CREDITS'
  | 'REPEAT_COURSE'
  | 'FAIL_COURSE'
  | 'ADD_COURSE'
  | 'LEAVE_OF_ABSENCE'
  | 'GRADUATE_EARLY'
  | 'DELAY_GRADUATION'
  | 'TRANSFER'
  | 'OTHER';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type ImpactCategory =
  | 'financial_aid'
  | 'scholarship'
  | 'sap'
  | 'enrollment_status'
  | 'graduation'
  | 'gpa'
  | 'compliance'
  | 'administrative';

export type AppealStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pending_docs'
  | 'approved'
  | 'denied'
  | 'withdrawn';

export type SimulationStatus = 'pending' | 'running' | 'completed' | 'failed';

export type ImportJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'partial';

export type IntegrationType =
  | 'csv'
  | 'banner'
  | 'workday'
  | 'peoplesoft'
  | 'colleague'
  | 'custom';

// ─── Domain Snapshots (lightweight, used in rule engine) ─────────────────────

export interface ProgramSnapshot {
  id: string;
  code: string;
  name: string;
  degreeType: string | null;
  totalCredits: number | null;
}

export interface EnrollmentSnapshot {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  status: CourseEnrollmentStatus;
  grade: string | null;
  isRepeated: boolean;
}

export interface AidAwardSnapshot {
  id: string;
  name: string;
  type: AidType;
  amount: number;
  status: AidStatus;
  conditions: AidCondition[];
}

export interface ScholarshipSnapshot {
  id: string;
  name: string;
  amount: number;
  conditions: ScholarshipCondition[];
}

export interface AidCondition {
  type: 'min_credits' | 'min_gpa' | 'enrollment_status' | 'sap_status' | 'other';
  value: number | string;
  description: string;
}

export interface ScholarshipCondition {
  type: 'min_credits' | 'min_gpa' | 'enrollment_status' | 'program' | 'other';
  value: number | string;
  description: string;
}

// ─── Student State (canonical representation for rule engine) ─────────────────

export interface StudentState {
  studentId: string;
  institutionId: string;
  termId: string;
  termCode: string;

  // Academic
  creditsEnrolled: number;
  creditsCompleted: number;
  creditsAttempted: number;
  creditsEarned: number;
  cumulativeGpa: number;
  termGpa: number;
  enrollmentStatus: EnrollmentStatus;
  academicStanding: AcademicStanding;
  level: StudentLevel;
  expectedGraduation: string; // ISO date string YYYY-MM-DD

  // SAP
  sapStatus: SAPStatus;
  sapPaceRate: number; // 0–1
  sapTimeframeUsed: number; // 0–1, % of max attempted
  sapCumulativeGpa: number;

  // Program
  program: ProgramSnapshot;

  // Enrollments (current term)
  enrollments: EnrollmentSnapshot[];

  // Financial Aid
  aidAwards: AidAwardSnapshot[];
  scholarships: ScholarshipSnapshot[];

  // Total annual aid
  totalAidAmount: number;
}

// ─── Rule Engine types ────────────────────────────────────────────────────────

export type ComparisonOperator = '>' | '>=' | '<' | '<=' | '==' | '!=';

export interface FieldCondition {
  type: 'field';
  field: string;
  operator: ComparisonOperator;
  value: number | string | boolean;
}

export interface CompositeCondition {
  type: 'and' | 'or';
  conditions: RuleCondition[];
}

export interface NotCondition {
  type: 'not';
  condition: RuleCondition;
}

export type RuleCondition = FieldCondition | CompositeCondition | NotCondition;

export interface RuleResult {
  [key: string]: unknown;
  // e.g. { status: 'full_time' } or { eligible: true } or { impact: 'graduation_delay' }
}

export interface ConditionTrace {
  condition: RuleCondition;
  fieldValue?: unknown;
  passed: boolean;
  children?: ConditionTrace[];
}

export interface RuleEvaluation {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  ruleType: RuleType;
  passed: boolean;
  result: RuleResult;
  trace: ConditionTrace;
  policyVersionId?: string;
}

export interface RiskScores {
  financial: number; // 0–100
  academic: number;
  graduation: number;
  compliance: number;
  administrative: number;
  overall: number;
}

export interface Impact {
  id?: string;
  category: ImpactCategory;
  severity: RiskLevel | 'none';
  changed: boolean;
  title: string;
  description: string;
  currentValue: unknown;
  projectedValue: unknown;
  ruleId?: string;
  ruleCode?: string;
  policyVersionId?: string;
  policyChunkId?: string;
  policyName?: string;
  policyCitation?: string;
  evidence: Evidence[];
}

export interface Evidence {
  type: 'rule' | 'policy_chunk';
  id: string;
  text: string;
  citation: string;
}

export interface RecommendedAction {
  priority: number;
  action:
    | 'CONTACT_ADVISOR'
    | 'CONTACT_FINANCIAL_AID'
    | 'EXPLORE_ALTERNATIVES'
    | 'START_APPEAL'
    | 'REVIEW_REQUIREMENTS'
    | 'NO_ACTION_NEEDED';
  title: string;
  description: string;
  link?: string;
}

export interface SimulationResult {
  scenarioType: ScenarioType;
  overallRisk: RiskLevel;
  riskScores: RiskScores;
  impacts: Impact[];
  currentEvaluations: RuleEvaluation[];
  hypotheticalEvaluations: RuleEvaluation[];
  recommendedActions: RecommendedAction[];
  policyVersionIds: string[];
  ruleIds: string[];
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  requestId?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW_STUDENT'
  | 'RUN_SIMULATION'
  | 'VIEW_SIMULATION'
  | 'OVERRIDE_RISK'
  | 'ADD_NOTE'
  | 'CONTACT_STUDENT'
  | 'START_APPEAL'
  | 'REVIEW_APPEAL'
  | 'UPLOAD_POLICY'
  | 'APPROVE_RULE'
  | 'EDIT_RULE'
  | 'IMPORT_DATA'
  | 'EXPORT_DATA'
  | 'CHANGE_USER_ROLE'
  | 'UPDATE_SETTINGS'
  | 'SCRAPE_OPPORTUNITIES';

// ─── Opportunities (Legal Web Scraped & Ingested Resources) ───────────────────

export type OpportunityType =
  | 'scholarship'
  | 'student_job'
  | 'work_study'
  | 'grant'
  | 'emergency_aid'
  | 'fellowship'
  | 'internship';

export type OpportunityStatus = 'active' | 'expired' | 'pending_verification' | 'archived';

export interface OpportunityEligibilityCriteria {
  minGpa?: number;
  maxGpa?: number;
  minCreditsEnrolled?: number;
  requiredMajorCodes?: string[];
  eligibleLevels?: StudentLevel[];
  citizenshipRequirement?: string;
  financialNeedRequired?: boolean;
  additionalConditions?: Record<string, unknown>;
}

export interface Opportunity {
  id: string;
  institutionId?: string; // Optional if public/statewide
  type: OpportunityType;
  title: string;
  provider: string;
  description: string;
  amountOrWage?: string;
  amountNumeric?: number;
  applicationDeadline?: string;
  sourceUrl: string;
  sourceDomain: string;
  isVerified: boolean;
  status: OpportunityStatus;
  eligibility: OpportunityEligibilityCriteria;
  tags: string[];
  lastScrapedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityMatch {
  opportunity: Opportunity;
  matchScore: number; // 0–100
  matchedCriteria: string[];
  unmetCriteria: string[];
  isEligible: boolean;
}
