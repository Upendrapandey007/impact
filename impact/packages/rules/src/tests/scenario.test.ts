import { describe, expect, it } from 'vitest';
import { ScenarioBuilder } from '../scenario';
import { BASE_STUDENT } from './fixtures/base-student';

const builder = new ScenarioBuilder();

describe('ScenarioBuilder (Unit Tests)', () => {
  describe('DROP_COURSE', () => {
    it('reduces enrolled credits by dropped course credits', () => {
      const hypo = builder.build('DROP_COURSE', BASE_STUDENT, { courseId: 'BIO201' });
      expect(hypo.creditsEnrolled).toBe(12); // 15 - 3
      const dropped = hypo.enrollments.find((e) => e.courseId === 'BIO201');
      expect(dropped?.status).toBe('dropped');
    });

    it('throws error if course does not exist in student enrollments', () => {
      expect(() =>
        builder.build('DROP_COURSE', BASE_STUDENT, { courseId: 'NON_EXISTENT_999' }),
      ).toThrowError(/not found in current enrollments/);
    });

    it('correctly updates enrollment status when credits drop below full-time', () => {
      const twelveCreditStudent = {
        ...BASE_STUDENT,
        creditsEnrolled: 12,
      };
      const hypo = builder.build('DROP_COURSE', twelveCreditStudent, { courseId: 'BIO201' });
      expect(hypo.creditsEnrolled).toBe(9);
      expect(hypo.enrollmentStatus).toBe('half_time');
    });
  });

  describe('WITHDRAW', () => {
    it('sets credits enrolled to 0 and enrollment status to withdrawn', () => {
      const hypo = builder.build('WITHDRAW', BASE_STUDENT, {});
      expect(hypo.creditsEnrolled).toBe(0);
      expect(hypo.enrollmentStatus).toBe('withdrawn');
      expect(hypo.enrollments.every((e) => e.status === 'withdrawn')).toBe(true);
    });
  });

  describe('CHANGE_MAJOR', () => {
    it('updates the program object on hypothetical student state', () => {
      const newProgram = {
        id: 'PROG_BIO',
        code: 'BIO',
        name: 'Biological Sciences',
        degreeType: 'BS',
        totalCredits: 120,
      };
      const hypo = builder.build('CHANGE_MAJOR', BASE_STUDENT, { program: newProgram });
      expect(hypo.program.code).toBe('BIO');
      expect(hypo.program.name).toBe('Biological Sciences');
    });

    it('throws error if program parameter is missing', () => {
      expect(() => builder.build('CHANGE_MAJOR', BASE_STUDENT, {})).toThrowError(
        /requires a program parameter/,
      );
    });
  });

  describe('REDUCE_CREDITS', () => {
    it('reduces enrolled credits to target and marks dropped courses', () => {
      const hypo = builder.build('REDUCE_CREDITS', BASE_STUDENT, { targetCredits: 9 });
      expect(hypo.creditsEnrolled).toBe(9);
      expect(hypo.enrollmentStatus).toBe('half_time');
    });

    it('returns exact same state if target credits is >= current enrolled', () => {
      const hypo = builder.build('REDUCE_CREDITS', BASE_STUDENT, { targetCredits: 15 });
      expect(hypo.creditsEnrolled).toBe(15);
    });
  });

  describe('ADD_COURSE', () => {
    it('increases credits and appends a hypothetical enrollment', () => {
      const hypo = builder.build('ADD_COURSE', BASE_STUDENT, {
        courseId: 'CS401',
        courseCode: 'CS 401',
        courseTitle: 'Senior Capstone',
        courseCredits: 3,
      });
      expect(hypo.creditsEnrolled).toBe(18); // 15 + 3
      const added = hypo.enrollments.find((e) => e.courseId === 'CS401');
      expect(added).toBeDefined();
      expect(added?.courseCode).toBe('CS 401');
      expect(added?.credits).toBe(3);
    });
  });

  describe('FAIL_COURSE', () => {
    it('updates GPA, marks course as failed, and updates attempted credits', () => {
      const hypo = builder.build('FAIL_COURSE', BASE_STUDENT, { courseId: 'BIO201' });
      const failed = hypo.enrollments.find((e) => e.courseId === 'BIO201');
      expect(failed?.status).toBe('failed');
      expect(failed?.grade).toBe('F');
      expect(hypo.creditsAttempted).toBe(81); // 78 + 3
      expect(hypo.cumulativeGpa).toBeLessThan(BASE_STUDENT.cumulativeGpa);
    });
  });

  describe('calculateEnrollmentStatus helper', () => {
    it('classifies full_time for >= 12 credits', () => {
      expect(builder.calculateEnrollmentStatus(12)).toBe('full_time');
      expect(builder.calculateEnrollmentStatus(18)).toBe('full_time');
    });

    it('classifies half_time for 6 to 11.5 credits', () => {
      expect(builder.calculateEnrollmentStatus(6)).toBe('half_time');
      expect(builder.calculateEnrollmentStatus(11)).toBe('half_time');
    });

    it('classifies less_than_half_time for 1 to 5.5 credits', () => {
      expect(builder.calculateEnrollmentStatus(3)).toBe('less_than_half_time');
    });

    it('classifies withdrawn for 0 credits', () => {
      expect(builder.calculateEnrollmentStatus(0)).toBe('withdrawn');
    });
  });
});
