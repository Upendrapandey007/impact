import { describe, expect, it, vi } from 'vitest';
import { AdvisorService } from './advisor.service';

describe('AdvisorService (Unit Tests)', () => {
  const mockDb = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: 'log-1' }]),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'sim-1', overallRisk: 'low' }]),
        }),
      }),
    }),
    query: {
      simulations: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'sim-1',
            studentId: 'stu-1',
            overallRisk: 'critical',
            riskScores: { financial: 90, academic: 40 },
            createdAt: new Date(),
            student: {
              user: { name: 'Alex Brown', email: 'alex@apex.edu' },
              program: { code: 'BIO', name: 'Biological Sciences' },
            },
            scenario: { type: 'DROP_COURSE' },
          },
          {
            id: 'sim-2',
            studentId: 'stu-2',
            overallRisk: 'moderate',
            riskScores: { financial: 30, academic: 20 },
            createdAt: new Date(),
            student: {
              user: { name: 'Sarah Kim', email: 'sarah@apex.edu' },
              program: { code: 'CS', name: 'Computer Science' },
            },
            scenario: { type: 'CHANGE_MAJOR' },
          },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: 'sim-1',
          overallRisk: 'critical',
          riskScores: { financial: 90, academic: 40 },
        }),
      },
      students: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'stu-1',
          user: { name: 'Alex Brown' },
        }),
      },
      opportunities: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'opp-1',
          title: 'CS Peer Tutor',
        }),
      },
    },
  } as any;

  const service = new AdvisorService(mockDb);

  describe('getRiskQueue', () => {
    it('returns cohort summary metrics and paginated risk queue items', async () => {
      const result = await service.getRiskQueue({}, { institutionId: 'inst-1' } as any);

      expect(result.metrics.totalCritical).toBe(1);
      expect(result.metrics.totalModerate).toBe(1);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]!.studentName).toBe('Alex Brown');
      expect(result.data[0]!.overallRisk).toBe('critical');
    });

    it('filters queue by risk level', async () => {
      const result = await service.getRiskQueue(
        { riskLevel: 'critical' },
        { institutionId: 'inst-1' } as any,
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.overallRisk).toBe('critical');
    });
  });

  describe('overrideRisk', () => {
    it('overrides risk level and writes immutable audit log with justification reason', async () => {
      const overrideResult = await service.overrideRisk(
        'sim-1',
        {
          overriddenRiskLevel: 'low',
          justificationReason: 'Medical withdrawal granted for Fall 2026',
        },
        { id: 'adv-1', role: 'advisor', institutionId: 'inst-1' } as any,
      );

      expect(overrideResult.success).toBe(true);
      expect(overrideResult.previousRisk).toBe('critical');
      expect(overrideResult.newRisk).toBe('low');
      expect(overrideResult.justificationReason).toBe('Medical withdrawal granted for Fall 2026');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});
