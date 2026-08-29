import { describe, expect, it, vi } from 'vitest';
import { AiService } from './ai.service';

describe('AiService (Unit Tests)', () => {
  const mockDb = {
    query: {
      policyChunks: {
        findMany: vi.fn().mockResolvedValue([
          {
            chunkIndex: 0,
            text: 'Section 3.2: Full-Time Credit Requirement for Merit Scholarships. Students must maintain at least 15 enrolled credit hours per regular semester to receive full disbursement of institutional merit scholarships.',
            policyVersion: {
              versionLabel: 'v2026.1',
              policy: { name: '2026–27 Institutional Scholarship Handbook' },
            },
          },
        ]),
      },
    },
  } as any;

  const service = new AiService(mockDb);

  describe('answerPolicyQuestion', () => {
    it('returns grounded citation-backed response when relevant policy chunks exist', async () => {
      const result = await service.answerPolicyQuestion(
        { question: 'What is the credit requirement for merit scholarship?' },
        { institutionId: 'inst-1' } as any,
      );

      expect(result.isGrounded).toBe(true);
      expect(result.confidenceScore).toBeGreaterThan(0.8);
      expect(result.citations).toHaveLength(1);
      expect(result.citations[0]!.policyName).toContain('Scholarship Handbook');
      expect(result.answer).toContain('15 enrolled credit hours');
    });

    it('returns low confidence fallback when no relevant policy text is found', async () => {
      const result = await service.answerPolicyQuestion(
        { question: 'What is the parking permit fee for motorcycles?' },
        { institutionId: 'inst-1' } as any,
      );

      expect(result.isGrounded).toBe(false);
      expect(result.confidenceScore).toBeLessThan(0.5);
      expect(result.answer).toContain('could not find explicit policy language');
    });
  });

  describe('draftAppeal', () => {
    it('generates a structured formal appeal letter with student questionnaire inputs', async () => {
      const draft = await service.draftAppeal(
        {
          appealType: 'scholarship_credit_deficiency',
          termAffected: 'Fall 2026',
          mitigatingCircumstance: 'Severe respiratory illness during midterms requiring reduced course load.',
          academicSuccessPlan: 'Attending weekly tutoring and maintaining a 3.5 term GPA goal.',
        },
        { id: 'usr-student-1', role: 'student', institutionId: 'inst-1' } as any,
      );

      expect(draft.appealTitle).toBe('Scholarship Credit Minimum Deficiency Appeal');
      expect(draft.appealDraft).toContain('Subject: Formal Petition for Scholarship Credit Minimum Deficiency Appeal — Fall 2026');
      expect(draft.appealDraft).toContain('Severe respiratory illness during midterms');
      expect(draft.appealDraft).toContain('Attending weekly tutoring');
    });
  });
});
