import { describe, expect, it } from 'vitest';
import { RiskScorer } from '../risk';
import type { Impact } from '@impact/types';

const scorer = new RiskScorer();

describe('RiskScorer (Unit Tests)', () => {
  it('returns overall score 0 and low risk level when no impacts are changed', () => {
    const impacts: Impact[] = [
      {
        category: 'financial_aid',
        severity: 'none',
        changed: false,
        title: 'No change',
        description: 'Nothing changed',
        currentValue: {},
        projectedValue: {},
      },
    ];

    const result = scorer.score(impacts);
    expect(result.overall).toBe(0);
    expect(result.overallLevel).toBe('low');
    expect(result.financial).toBe(0);
  });

  it('correctly maps single critical financial aid impact to high/critical risk', () => {
    const impacts: Impact[] = [
      {
        category: 'financial_aid',
        severity: 'critical',
        changed: true,
        title: 'Loss of Pell Grant',
        description: 'Pell Grant lost due to credit reduction',
        currentValue: { eligible: true },
        projectedValue: { eligible: false },
      },
    ];

    const result = scorer.score(impacts);
    expect(result.financial).toBe(100); // 100 * 1.0
    expect(result.overall).toBe(100);
    expect(result.overallLevel).toBe('critical');
  });

  it('incorporates scholarship severity into financial risk score', () => {
    const impacts: Impact[] = [
      {
        category: 'scholarship',
        severity: 'high',
        changed: true,
        title: 'Loss of Merit Scholarship',
        description: 'Scholarship lost',
        currentValue: { eligible: true },
        projectedValue: { eligible: false },
      },
    ];

    const result = scorer.score(impacts);
    expect(result.financial).toBe(68); // 75 * 0.9 = 67.5 -> 68
    expect(result.overallLevel).toBe('high');
  });

  describe('scoreToLevel thresholds', () => {
    it('maps >= 80 to critical', () => {
      expect(scorer.scoreToLevel(80)).toBe('critical');
      expect(scorer.scoreToLevel(100)).toBe('critical');
    });

    it('maps 55..79 to high', () => {
      expect(scorer.scoreToLevel(55)).toBe('high');
      expect(scorer.scoreToLevel(79)).toBe('high');
    });

    it('maps 30..54 to moderate', () => {
      expect(scorer.scoreToLevel(30)).toBe('moderate');
      expect(scorer.scoreToLevel(54)).toBe('moderate');
    });

    it('maps < 30 to low', () => {
      expect(scorer.scoreToLevel(0)).toBe('low');
      expect(scorer.scoreToLevel(29)).toBe('low');
    });
  });
});
