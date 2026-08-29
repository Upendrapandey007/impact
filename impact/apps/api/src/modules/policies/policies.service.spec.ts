import { describe, expect, it } from 'vitest';
import { PoliciesService } from './policies.service';

describe('PoliciesService (Unit Tests)', () => {
  const mockDb = {} as any;
  const service = new PoliciesService(mockDb);

  describe('chunkText', () => {
    it('returns empty array for blank text', () => {
      expect(service.chunkText('')).toEqual([]);
      expect(service.chunkText('   ')).toEqual([]);
    });

    it('returns single chunk when text is shorter than chunkSize', () => {
      const text = 'This is a brief policy section regarding student enrollment.';
      const chunks = service.chunkText(text, 500, 50);
      expect(chunks).toHaveLength(1);
      expect(chunks[0]!.chunkIndex).toBe(0);
      expect(chunks[0]!.text).toBe(text);
      expect(chunks[0]!.wordCount).toBe(9);
    });

    it('splits long text into multiple overlapping chunks', () => {
      const paragraph1 = 'Section 1: General Financial Aid Guidelines. Students must maintain enrollment.';
      const paragraph2 = 'Section 2: Maximum Timeframe Rules. Students cannot exceed 150 percent of program length.';
      const paragraph3 = 'Section 3: Appeals Process. Any student with mitigating circumstances may submit an appeal.';
      const fullText = `${paragraph1}\n${paragraph2}\n${paragraph3}`;

      const chunks = service.chunkText(fullText, 90, 20);
      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0]!.chunkIndex).toBe(0);
      expect(chunks[1]!.chunkIndex).toBe(1);
    });
  });
});
