import type { MarketData, ValuationAnalysis } from './types';

/**
 * Valuation Agent
 *
 * Analyzes if a stock is undervalued based on fundamental metrics.
 * Uses multiple valuation approaches:
 * - P/E ratio comparison
 * - P/B ratio analysis
 * - Price-to-Sales analysis
 * - Earnings quality (ROE, margins)
 */
export async function analyzeValuation(data: MarketData): Promise<ValuationAnalysis> {
  const metrics: Record<string, any> = {};
  let score = 50; // neutral starting point
  let confidence = 0;
  const reasons: string[] = [];

  // P/E Ratio Analysis (weight: 30%)
  if (data.pe !== undefined && data.pe !== null) {
    metrics.pe = data.pe;
    confidence += 25;

    if (data.pe < 15) {
      score += 15;
      reasons.push(`Low P/E ratio of ${data.pe.toFixed(1)} indicates potential undervaluation`);
    } else if (data.pe < 25) {
      score += 5;
      reasons.push(`Moderate P/E ratio of ${data.pe.toFixed(1)}`);
    } else if (data.pe > 40) {
      score -= 10;
      reasons.push(`High P/E ratio of ${data.pe.toFixed(1)} suggests overvaluation`);
    }
  }

  // P/B Ratio Analysis (weight: 20%)
  if (data.pb !== undefined && data.pb !== null) {
    metrics.pb = data.pb;
    confidence += 20;

    if (data.pb < 1.0) {
      score += 10;
      reasons.push(`P/B ratio of ${data.pb.toFixed(2)} below 1.0 - trading below book value`);
    } else if (data.pb < 3.0) {
      score += 3;
    } else if (data.pb > 5.0) {
      score -= 8;
      reasons.push(`High P/B ratio of ${data.pb.toFixed(2)}`);
    }
  }

  // P/S Ratio Analysis (weight: 15%)
  if (data.ps !== undefined && data.ps !== null) {
    metrics.ps = data.ps;
    confidence += 15;

    if (data.ps < 2.0) {
      score += 8;
      reasons.push(`Low P/S ratio of ${data.ps.toFixed(2)}`);
    } else if (data.ps > 10.0) {
      score -= 6;
      reasons.push(`High P/S ratio of ${data.ps.toFixed(2)}`);
    }
  }

  // ROE Analysis - Quality Check (weight: 20%)
  if (data.roe !== undefined && data.roe !== null) {
    metrics.roe = data.roe;
    confidence += 20;

    if (data.roe > 15) {
      score += 10;
      reasons.push(`Strong ROE of ${data.roe.toFixed(1)}% indicates quality company`);
    } else if (data.roe > 10) {
      score += 5;
    } else if (data.roe < 5) {
      score -= 8;
      reasons.push(`Low ROE of ${data.roe.toFixed(1)}%`);
    }
  }

  // Net Margin Analysis (weight: 15%)
  if (data.netMargin !== undefined && data.netMargin !== null) {
    metrics.netMargin = data.netMargin;
    confidence += 20;

    if (data.netMargin > 20) {
      score += 8;
      reasons.push(`Excellent net margin of ${data.netMargin.toFixed(1)}%`);
    } else if (data.netMargin > 10) {
      score += 4;
    } else if (data.netMargin < 5) {
      score -= 6;
    }
  }

  // Ensure score and confidence are in valid ranges
  score = Math.max(0, Math.min(100, score));
  confidence = Math.min(100, confidence);

  // Calculate intrinsic value estimate (simplified DCF approach)
  let intrinsicValue: number | undefined;
  let upside: number | undefined;

  if (data.eps && data.roe && data.roe > 0) {
    // Simple intrinsic value = EPS * (1 + growth_rate) * PE_target
    // Assume growth rate correlates with ROE quality
    const growthRate = Math.min(data.roe / 100, 0.15); // Cap at 15%
    const targetPE = data.roe > 15 ? 18 : 12; // Quality companies deserve higher PE

    intrinsicValue = data.eps * (1 + growthRate) * targetPE;
    upside = ((intrinsicValue - data.currentPrice) / data.currentPrice) * 100;

    metrics.intrinsicValue = intrinsicValue;
    metrics.upside = upside;

    // Adjust score based on upside potential
    if (upside > 30) {
      score += 15;
      reasons.push(`Significant upside potential of ${upside.toFixed(1)}%`);
    } else if (upside > 15) {
      score += 8;
      reasons.push(`Moderate upside potential of ${upside.toFixed(1)}%`);
    } else if (upside < -15) {
      score -= 10;
      reasons.push(`Downside risk of ${Math.abs(upside).toFixed(1)}%`);
    }

    score = Math.max(0, Math.min(100, score));
  }

  return {
    score,
    confidence,
    reasoning: reasons.join('. '),
    metrics,
    intrinsicValue,
    upside,
  };
}
