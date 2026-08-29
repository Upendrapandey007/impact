import type {
  EnrollmentSnapshot,
  RuleType,
  ScenarioType,
  StudentState,
} from '@impact/types';

/**
 * ScenarioBuilder
 *
 * Transforms a student's current state + decision parameters
 * into a hypothetical StudentState for differential evaluation.
 *
 * All transformations are deterministic. No LLM involvement.
 */
export class ScenarioBuilder {
  build(
    type: ScenarioType,
    currentState: StudentState,
    parameters: Record<string, unknown>,
  ): StudentState {
    switch (type) {
      case 'DROP_COURSE':
        return this.buildDropCourse(currentState, parameters);
      case 'WITHDRAW':
        return this.buildWithdraw(currentState, parameters);
      case 'CHANGE_MAJOR':
        return this.buildChangeMajor(currentState, parameters);
      case 'REDUCE_CREDITS':
        return this.buildReduceCredits(currentState, parameters);
      case 'ADD_COURSE':
        return this.buildAddCourse(currentState, parameters);
      case 'FAIL_COURSE':
        return this.buildFailCourse(currentState, parameters);
      case 'REPEAT_COURSE':
        return this.buildRepeatCourse(currentState, parameters);
      default:
        // For unimplemented types, return current state (no-op)
        return { ...currentState };
    }
  }

  // ─── DROP_COURSE ────────────────────────────────────────────────────────────

  buildDropCourse(
    state: StudentState,
    params: Record<string, unknown>,
  ): StudentState {
    const courseId = String(params['courseId'] ?? '');
    const enrollment = state.enrollments.find(
      (e) => e.courseId === courseId && e.status === 'enrolled',
    );

    if (!enrollment) {
      throw new Error(`Course ${courseId} not found in current enrollments`);
    }

    const newCreditsEnrolled = Math.max(0, state.creditsEnrolled - enrollment.credits);
    const newEnrollments: EnrollmentSnapshot[] = state.enrollments.map((e) =>
      e.courseId === courseId ? { ...e, status: 'dropped' as const } : e,
    );

    // Recalculate enrollment status based on new credit count
    const newEnrollmentStatus = this.calculateEnrollmentStatus(newCreditsEnrolled);

    // SAP pace rate would decrease since credits attempted includes dropped course
    // but credits earned won't (dropped courses typically don't count as attempted)
    // This is institution-dependent; we model the common case here
    const newSapPaceRate = this.calculateSapPaceRate(
      state.creditsEarned,
      state.creditsAttempted, // Dropped course still attempted if after census
    );

    return {
      ...state,
      creditsEnrolled: newCreditsEnrolled,
      enrollmentStatus: newEnrollmentStatus,
      enrollments: newEnrollments,
      sapPaceRate: newSapPaceRate,
    };
  }

  // ─── WITHDRAW ───────────────────────────────────────────────────────────────

  buildWithdraw(
    state: StudentState,
    _params: Record<string, unknown>,
  ): StudentState {
    return {
      ...state,
      creditsEnrolled: 0,
      enrollmentStatus: 'withdrawn',
      enrollments: state.enrollments.map((e) => ({
        ...e,
        status: 'withdrawn' as const,
      })),
      sapPaceRate: this.calculateSapPaceRate(
        state.creditsEarned,
        state.creditsAttempted + state.creditsEnrolled, // All current term = attempted
      ),
    };
  }

  // ─── CHANGE_MAJOR ────────────────────────────────────────────────────────────

  buildChangeMajor(
    state: StudentState,
    params: Record<string, unknown>,
  ): StudentState {
    const newProgram = params['program'] as StudentState['program'] | undefined;

    if (!newProgram) {
      throw new Error('CHANGE_MAJOR scenario requires a program parameter');
    }

    return {
      ...state,
      program: newProgram,
      // Note: graduation timeline change is calculated by graduation rule evaluator
    };
  }

  // ─── REDUCE_CREDITS ──────────────────────────────────────────────────────────

  buildReduceCredits(
    state: StudentState,
    params: Record<string, unknown>,
  ): StudentState {
    const targetCredits = Number(params['targetCredits'] ?? 0);
    const creditsToRemove = state.creditsEnrolled - targetCredits;

    if (creditsToRemove <= 0) {
      // No reduction needed — same state
      return { ...state };
    }

    // Drop courses with lowest priority (last enrolled first)
    // This is a simplification; real implementation would ask which courses
    const enrolledCourses = state.enrollments
      .filter((e) => e.status === 'enrolled')
      .sort((a, b) => a.credits - b.credits); // drop smallest first

    let removed = 0;
    const updatedEnrollments = state.enrollments.map((e) => {
      if (e.status !== 'enrolled') return e;
      if (removed >= creditsToRemove) return e;

      const course = enrolledCourses.find((c) => c.courseId === e.courseId);
      if (!course) return e;

      removed += course.credits;
      return { ...e, status: 'dropped' as const };
    });

    const newCredits = Math.max(0, targetCredits);
    return {
      ...state,
      creditsEnrolled: newCredits,
      enrollmentStatus: this.calculateEnrollmentStatus(newCredits),
      enrollments: updatedEnrollments,
    };
  }

  // ─── ADD_COURSE ──────────────────────────────────────────────────────────────

  buildAddCourse(
    state: StudentState,
    params: Record<string, unknown>,
  ): StudentState {
    const courseCredits = Number(params['courseCredits'] ?? 3);
    const courseId = String(params['courseId'] ?? 'NEW_COURSE');
    const courseCode = String(params['courseCode'] ?? 'NEW');
    const courseTitle = String(params['courseTitle'] ?? 'New Course');

    const newCreditsEnrolled = state.creditsEnrolled + courseCredits;
    const newEnrollment: EnrollmentSnapshot = {
      id: 'hypothetical',
      courseId,
      courseCode,
      courseTitle,
      credits: courseCredits,
      status: 'enrolled',
      grade: null,
      isRepeated: false,
    };

    return {
      ...state,
      creditsEnrolled: newCreditsEnrolled,
      enrollmentStatus: this.calculateEnrollmentStatus(newCreditsEnrolled),
      enrollments: [...state.enrollments, newEnrollment],
    };
  }

  // ─── FAIL_COURSE ─────────────────────────────────────────────────────────────

  buildFailCourse(
    state: StudentState,
    params: Record<string, unknown>,
  ): StudentState {
    const courseId = String(params['courseId'] ?? '');
    const enrollment = state.enrollments.find(
      (e) => e.courseId === courseId && e.status === 'enrolled',
    );

    if (!enrollment) {
      throw new Error(`Course ${courseId} not found in current enrollments`);
    }

    // Failing a course: credits attempted increase, credits earned do not
    const updatedEnrollments = state.enrollments.map((e) =>
      e.courseId === courseId
        ? { ...e, status: 'failed' as const, grade: 'F', gradePoints: 0 }
        : e,
    );

    const newCreditsAttempted = state.creditsAttempted + enrollment.credits;
    const newCumulativeGpa = this.estimateNewGpa(
      state.cumulativeGpa,
      state.creditsAttempted,
      0, // 0.0 for F
      enrollment.credits,
    );
    const newSapPaceRate = this.calculateSapPaceRate(state.creditsEarned, newCreditsAttempted);

    return {
      ...state,
      creditsAttempted: newCreditsAttempted,
      creditsEnrolled: state.creditsEnrolled - enrollment.credits,
      cumulativeGpa: newCumulativeGpa,
      sapPaceRate: newSapPaceRate,
      enrollments: updatedEnrollments,
    };
  }

  // ─── REPEAT_COURSE ────────────────────────────────────────────────────────────

  buildRepeatCourse(
    state: StudentState,
    params: Record<string, unknown>,
  ): StudentState {
    const courseId = String(params['courseId'] ?? '');
    const courseCredits = Number(params['courseCredits'] ?? 3);

    // Repeating a course adds to attempted credits count
    // Some institutions replace the old grade; model common case (attempted increases)
    const newCreditsEnrolled = state.creditsEnrolled + courseCredits;
    const newEnrollment: EnrollmentSnapshot = {
      id: 'hypothetical-repeat',
      courseId,
      courseCode: String(params['courseCode'] ?? ''),
      courseTitle: String(params['courseTitle'] ?? ''),
      credits: courseCredits,
      status: 'enrolled',
      grade: null,
      isRepeated: true,
    };

    return {
      ...state,
      creditsEnrolled: newCreditsEnrolled,
      enrollmentStatus: this.calculateEnrollmentStatus(newCreditsEnrolled),
      enrollments: [...state.enrollments, newEnrollment],
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  /**
   * Common enrollment status thresholds (federal standard).
   * Institutions may override via rules.
   */
  calculateEnrollmentStatus(credits: number): StudentState['enrollmentStatus'] {
    if (credits >= 12) return 'full_time';
    if (credits >= 6) return 'half_time';
    if (credits > 0) return 'less_than_half_time';
    return 'withdrawn';
  }

  calculateSapPaceRate(creditsEarned: number, creditsAttempted: number): number {
    if (creditsAttempted === 0) return 1;
    return Math.min(1, creditsEarned / creditsAttempted);
  }

  /**
   * Estimates new cumulative GPA after adding a course with given grade points.
   * Formula: ((currentGpa * currentCredits) + (newGradePoints * newCredits)) / totalCredits
   */
  estimateNewGpa(
    currentGpa: number,
    currentCreditsAttempted: number,
    newGradePoints: number,
    newCredits: number,
  ): number {
    const totalQualityPoints = currentGpa * currentCreditsAttempted + newGradePoints * newCredits;
    const totalCredits = currentCreditsAttempted + newCredits;
    if (totalCredits === 0) return 0;
    return Math.round((totalQualityPoints / totalCredits) * 1000) / 1000;
  }
}

// ─── Rule type helpers ────────────────────────────────────────────────────────

export const SCENARIO_TO_RULE_TYPES: Partial<Record<ScenarioType, RuleType[]>> = {
  DROP_COURSE: [
    'enrollment_status',
    'scholarship_eligibility',
    'sap_quantitative',
    'sap_qualitative',
    'sap_timeframe',
    'aid_eligibility',
    'graduation_requirement',
    'credit_requirement',
  ],
  WITHDRAW: [
    'enrollment_status',
    'scholarship_eligibility',
    'sap_quantitative',
    'sap_qualitative',
    'sap_timeframe',
    'aid_eligibility',
  ],
  CHANGE_MAJOR: ['graduation_requirement', 'credit_requirement'],
  REDUCE_CREDITS: [
    'enrollment_status',
    'scholarship_eligibility',
    'aid_eligibility',
    'credit_requirement',
  ],
  FAIL_COURSE: [
    'sap_quantitative',
    'sap_qualitative',
    'sap_timeframe',
    'scholarship_eligibility',
    'graduation_requirement',
    'gpa_requirement',
  ],
};
