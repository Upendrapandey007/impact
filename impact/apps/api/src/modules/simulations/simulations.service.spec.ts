import { describe, expect, it, vi } from 'vitest';
import { SimulationsService } from './simulations.service';

describe('SimulationsService (Unit Tests)', () => {
  const mockQueue = {
    add: vi.fn().mockResolvedValue({ id: 'job-1' }),
  } as any;

  const mockDb = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'sim-123' }]),
      }),
    }),
    query: {
      students: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'stu-1',
          userId: 'usr-1',
          institutionId: 'inst-1',
          level: 'junior',
          enrollmentStatus: 'full_time',
          expectedGraduation: 'May 2027',
          program: { id: 'prog-1', code: 'CS', name: 'Computer Science' },
        }),
      },
      terms: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'term-1',
          code: 'FA26',
          isCurrent: true,
        }),
      },
      academicRecords: {
        findFirst: vi.fn().mockResolvedValue({
          cumulativeGpa: 3.4,
          creditsEarned: 60,
          creditsAttempted: 60,
          standing: 'good',
        }),
      },
      enrollments: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'enr-1', courseId: 'crs-1', status: 'enrolled', course: { credits: 3, code: 'BIO 201' } },
          { id: 'enr-2', courseId: 'crs-2', status: 'enrolled', course: { credits: 3, code: 'CS 301' } },
          { id: 'enr-3', courseId: 'crs-3', status: 'enrolled', course: { credits: 3, code: 'MATH 201' } },
          { id: 'enr-4', courseId: 'crs-4', status: 'enrolled', course: { credits: 3, code: 'ENG 101' } },
          { id: 'enr-5', courseId: 'crs-5', status: 'enrolled', course: { credits: 3, code: 'CS 201' } },
        ]),
      },
      financialAidAwards: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'aid-1', name: 'Pell Grant', aidType: 'federal_pell', amount: 3500, status: 'accepted' },
        ]),
      },
      scholarships: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      sapRecords: {
        findFirst: vi.fn().mockResolvedValue({
          status: 'satisfactory',
          paceRate: 0.95,
          qualitativeGpa: 3.4,
        }),
      },
      rules: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'rule-sch-1',
            ruleCode: 'RULE-SCH-001',
            type: 'scholarship_eligibility',
            name: 'Merit full-time requirement',
            conditionJson: {
              type: 'field',
              field: 'creditsEnrolled',
              operator: '>=',
              value: 12,
            },
            resultJson: { eligible: true },
            priority: 10,
            status: 'active',
          },
        ]),
      },
    },
  } as any;

  const service = new SimulationsService(mockDb, mockQueue);

  describe('buildStudentState', () => {
    it('hydrates student state and aggregates 15 enrolled credits across active courses', async () => {
      const state = await service.buildStudentState('stu-1', 'inst-1');

      expect(state.studentId).toBe('stu-1');
      expect(state.creditsEnrolled).toBe(15);
      expect(state.cumulativeGpa).toBe(3.4);
      expect(state.sapPaceRate).toBe(0.95);
      expect(state.enrollments).toHaveLength(5);
    });
  });

  describe('simulatePreview (Fast Synchronous Evaluation)', () => {
    it('executes in-memory simulation and calculates prospective output', async () => {
      const result = await service.simulatePreview(
        {
          type: 'DROP_COURSE',
          parameters: { courseId: 'crs-1', credits: 3 },
          studentId: 'stu-1',
        },
        { id: 'usr-1', institutionId: 'inst-1', role: 'student' } as any,
      );

      expect(result.scenarioType).toBe('DROP_COURSE');
      expect(result.overallRisk).toBeDefined();
      expect(result.riskScores).toBeDefined();
      expect(result.disclaimer).toContain('informational only');
    });
  });

  describe('createSimulation (Queue Dispatch)', () => {
    it('persists scenario and simulation records and enqueues job with priority', async () => {
      const output = await service.createSimulation(
        {
          type: 'DROP_COURSE',
          parameters: { courseId: 'crs-1', credits: 3 },
          studentId: 'stu-1',
        },
        { id: 'usr-1', institutionId: 'inst-1', role: 'student' } as any,
      );

      expect(output.simulationId).toBe('sim-123');
      expect(output.status).toBe('pending');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-simulation',
        expect.objectContaining({
          simulationId: 'sim-123',
          scenarioType: 'DROP_COURSE',
        }),
        { priority: 1 },
      );
    });
  });
});
