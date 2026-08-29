import { describe, expect, it } from 'vitest';
import { ImportJobsService } from './import-jobs.service';

describe('ImportJobsService (Unit Tests)', () => {
  // Test instance with mocked DB
  const mockDb = {
    insert: () => ({
      values: () => ({
        returning: () => [{ id: 'job-123' }],
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      }),
    }),
    query: {
      importJobs: {
        findFirst: () => Promise.resolve({ id: 'job-123', status: 'completed' }),
      },
    },
  } as any;

  const service = new ImportJobsService(mockDb);

  describe('CSV Line Parsing (parseCsvLine)', () => {
    it('correctly parses simple comma-separated fields', () => {
      const parsed = (service as any).parseCsvLine('BIO201,Introduction to Biology,3.00,Biology');
      expect(parsed).toEqual(['BIO201', 'Introduction to Biology', '3.00', 'Biology']);
    });

    it('correctly handles quoted fields containing commas', () => {
      const parsed = (service as any).parseCsvLine(
        'CS301,"Data Structures, Algorithms, and Complexity",3.00,CS',
      );
      expect(parsed).toEqual([
        'CS301',
        'Data Structures, Algorithms, and Complexity',
        '3.00',
        'CS',
      ]);
    });
  });

  describe('Full CSV Parsing (parseCsv)', () => {
    it('returns empty headers and rows for empty content', () => {
      const { headers, rows } = (service as any).parseCsv('');
      expect(headers).toHaveLength(0);
      expect(rows).toHaveLength(0);
    });

    it('parses headers and multiple rows into structured records', () => {
      const csv = `code,title,credits,department\nBIO201,Intro Biology,3.00,Biology\nCS101,Intro CS,3.00,CS`;
      const { headers, rows } = (service as any).parseCsv(csv);
      expect(headers).toEqual(['code', 'title', 'credits', 'department']);
      expect(rows).toHaveLength(2);
      expect(rows[0]!['code']).toBe('BIO201');
      expect(rows[1]!['title']).toBe('Intro CS');
    });
  });
});
