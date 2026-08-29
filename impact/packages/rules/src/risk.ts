import type {
  ImpactCategory,
  RiskLevel,
  RiskScores,
  Impact,
} from '@impact/types';

/**
 * RiskScorer
 *
 * Converts a set of Impacts into multi-dimensional risk scores (0–100).
 * Scores are risk indices, NOT probabilities.
 * The overall risk level (low/moderate/high/critical) is derived from the overall score.
 *
 * Scoring methodology:
 * - Each impact has a severity (none/low/moderate/high/critical)
 * - Each category has a weight reflecting its importance
 * - Score = max severity in that category × category weight
 * - Overall = weighted average of category scores, capped at 100
 */
export class RiskScorer {
  private readonly categoryWeights: Record<ImpactCategory, number> = {
    financial_aid: 1.0,
    scholarship: 0.9,
    sap: 0.95,
    enrollment_status: 0.85,
    graduation: 0.7,
    gpa: 0.5,
    compliance: 0.8,
    administrative: 0.4,
  };

  private readonly severityScores: Record<string, number> = {
    none: 0,
    low: 15,
    moderate: 40,
    high: 75,
    critical: 100,
  };

  /**
   * Computes risk scores from a set of impacts.
   * Only considers impacts where changed = true.
   */
  score(impacts: Impact[]): RiskScores & { overallLevel: RiskLevel } {
    const changedImpacts = impacts.filter((i) => i.changed && i.severity !== 'none');

    const categoryScores = this.scoreByCategoryWeighted(changedImpacts);
    const overall = this.computeOverall(categoryScores);

    return {
      financial: Math.max(categoryScores.financial_aid ?? 0, categoryScores.scholarship ?? 0),
      academic: Math.max(categoryScores.gpa ?? 0, categoryScores.sap ?? 0),
      graduation: categoryScores.graduation ?? 0,
      compliance: categoryScores.compliance ?? 0,
      administrative: categoryScores.administrative ?? 0,
      overall,
      overallLevel: this.scoreToLevel(overall),
    };
  }

  private scoreByCategoryWeighted(
    impacts: Impact[],
  ): Partial<Record<ImpactCategory, number>> {
    const byCategory = this.groupByCategory(impacts);
    const result: Partial<Record<ImpactCategory, number>> = {};

    for (const [category, categoryImpacts] of Object.entries(byCategory)) {
      const cat = category as ImpactCategory;
      const maxSeverityScore = Math.max(
        ...categoryImpacts.map((i) => this.severityScores[i.severity] ?? 0),
      );
      const weight = this.categoryWeights[cat] ?? 0.5;
      result[cat] = Math.round(maxSeverityScore * weight);
    }

    return result;
  }

  private groupByCategory(
    impacts: Impact[],
  ): Partial<Record<ImpactCategory, Impact[]>> {
    const result: Partial<Record<ImpactCategory, Impact[]>> = {};
    for (const impact of impacts) {
      if (!result[impact.category]) {
        result[impact.category] = [];
      }
      result[impact.category]!.push(impact);
    }
    return result;
  }

  private computeOverall(
    categoryScores: Partial<Record<ImpactCategory, number>>,
  ): number {
    const scores = Object.values(categoryScores).filter(
      (s): s is number => s !== undefined,
    );
    if (scores.length === 0) return 0;

    // Overall = weighted average with highest-weight categories pulling it up
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Blend: 60% max + 40% average (ensures high-severity categories dominate)
    return Math.min(100, Math.round(maxScore * 0.6 + avgScore * 0.4));
  }

  scoreToLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 55) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
  }
}
