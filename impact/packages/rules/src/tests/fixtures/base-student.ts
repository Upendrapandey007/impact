import type { StudentState } from '@impact/types';

/**
 * Shared test fixture — a healthy student in good standing.
 * Customize per test case.
 */
export const BASE_STUDENT: StudentState = {
  studentId: 'STU_001',
  institutionId: 'INST_001',
  termId: 'TERM_2026FA',
  termCode: '2026FA',

  // Academic
  creditsEnrolled: 15,
  creditsCompleted: 78,
  creditsAttempted: 78,
  creditsEarned: 75,
  cumulativeGpa: 3.18,
  termGpa: 3.21,
  enrollmentStatus: 'full_time',
  academicStanding: 'good',
  level: 'junior',
  expectedGraduation: '2027-05-15',

  // SAP
  sapStatus: 'satisfactory',
  sapPaceRate: 0.96, // 75/78
  sapTimeframeUsed: 0.65,
  sapCumulativeGpa: 3.18,

  // Program
  program: {
    id: 'PROG_CS',
    code: 'CS',
    name: 'Computer Science',
    degreeType: 'BS',
    totalCredits: 120,
  },

  // Enrollments (current term — 5 courses, 15 credits)
  enrollments: [
    {
      id: 'ENR_001',
      courseId: 'BIO201',
      courseCode: 'BIO 201',
      courseTitle: 'Introduction to Biology',
      credits: 3,
      status: 'enrolled',
      grade: null,
      isRepeated: false,
    },
    {
      id: 'ENR_002',
      courseId: 'CS301',
      courseCode: 'CS 301',
      courseTitle: 'Data Structures',
      credits: 3,
      status: 'enrolled',
      grade: null,
      isRepeated: false,
    },
    {
      id: 'ENR_003',
      courseId: 'MATH201',
      courseCode: 'MATH 201',
      courseTitle: 'Calculus II',
      credits: 3,
      status: 'enrolled',
      grade: null,
      isRepeated: false,
    },
    {
      id: 'ENR_004',
      courseId: 'ENG101',
      courseCode: 'ENG 101',
      courseTitle: 'Technical Writing',
      credits: 3,
      status: 'enrolled',
      grade: null,
      isRepeated: false,
    },
    {
      id: 'ENR_005',
      courseId: 'CS201',
      courseCode: 'CS 201',
      courseTitle: 'Algorithms',
      credits: 3,
      status: 'enrolled',
      grade: null,
      isRepeated: false,
    },
  ],

  // Financial Aid
  aidAwards: [
    {
      id: 'AID_001',
      name: 'Pell Grant',
      type: 'PELL',
      amount: 3500,
      status: 'disbursed',
      conditions: [
        {
          type: 'enrollment_status',
          value: 'half_time',
          description: 'Must be at least half-time',
        },
      ],
    },
    {
      id: 'AID_002',
      name: 'Subsidized Loan',
      type: 'LOAN_SUB',
      amount: 3500,
      status: 'disbursed',
      conditions: [],
    },
  ],

  // Scholarships
  scholarships: [
    {
      id: 'SCH_001',
      name: 'University Merit Scholarship',
      amount: 2500,
      conditions: [
        {
          type: 'min_credits',
          value: 15,
          description: 'Must be enrolled in at least 15 credits per semester',
        },
        {
          type: 'min_gpa',
          value: 3.0,
          description: 'Must maintain a minimum 3.0 GPA',
        },
      ],
    },
  ],

  totalAidAmount: 9500,
};
