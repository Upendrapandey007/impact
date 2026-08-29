import { describe, expect, it } from 'vitest';
import { OpportunitiesService } from './opportunities.service';

describe('OpportunitiesService (Unit Tests)', () => {
  const mockStudentProfile = {
    id: 'stu-1',
    academicSummary: {
      cumulativeGpa: 3.2,
      creditsEnrolled: 15,
    },
    program: {
      code: 'CS',
    },
  };

  const mockStudentsService = {
    getStudentById: () => Promise.resolve(mockStudentProfile),
  } as any;

  const mockDb = {
    query: {
      opportunities: {
        findMany: () =>
          Promise.resolve([
            {
              id: 'opp-1',
              title: 'CS Peer Tutor',
              type: 'student_job',
              eligibilityCriteria: {
                minGpa: 3.0,
                requiredMajorCodes: ['CS'],
                minCreditsEnrolled: 6,
              },
            },
            {
              id: 'opp-2',
              title: 'Nursing Honor Scholarship',
              type: 'scholarship',
              eligibilityCriteria: {
                minGpa: 3.8,
                requiredMajorCodes: ['NUR'],
              },
            },
          ]),
      },
    },
  } as any;

  const service = new OpportunitiesService(mockDb, mockStudentsService);

  describe('matchStudentOpportunities', () => {
    it('correctly qualifies eligible opportunities and flags unmet criteria for ineligible ones', async () => {
      const { matches, totalEligible } = await service.matchStudentOpportunities('stu-1', {
        institutionId: 'inst-1',
      } as any);

      expect(totalEligible).toBe(1);
      expect(matches).toHaveLength(2);

      // CS Tutor should be eligible (GPA 3.2 >= 3.0, Major CS == CS, Credits 15 >= 6)
      const tutorMatch = matches.find((m) => m.opportunity.id === 'opp-1');
      expect(tutorMatch?.isEligible).toBe(true);
      expect(tutorMatch?.matchScore).toBe(100);

      // Nursing Scholarship should be ineligible (GPA 3.2 < 3.8, Major CS != NUR)
      const nursingMatch = matches.find((m) => m.opportunity.id === 'opp-2');
      expect(nursingMatch?.isEligible).toBe(false);
      expect(nursingMatch?.unmetCriteria.length).toBeGreaterThan(0);
    });
  });
});
