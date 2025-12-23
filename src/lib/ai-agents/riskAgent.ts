import type { MarketData, RiskAnalysis } from './types';

/**
 * Risk Assessment Agent
 *
 * Evaluates the risk profile of a stock based on:
 * - Volatility
 * - Drawdown history
 * - Beta (market sensitivity)
 * - Price stability
 */
export async function assessRisk(data: MarketData): Promise<RiskAnalysis> {
  const metrics: Record<string, any> = {};
  let score = 50; // neutral starting point (lower score = higher risk)
  let confidence = 0;
  const reasons: string[] = [];
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  // Volatility Analysis (weight: 40%)
  if (data.volatility !== undefined && data.volatility !== null) {
    metrics.volatility = data.volatility;
    confidence += 35;

    if (data.volatility < 20) {
      score += 20;
      riskLevel = 'LOW';
      reasons.push(`Low volatility of ${data.volatility.toFixed(1)}% indicates stability`);
    } else if (data.volatility < 35) {
      score += 5;
      riskLevel = 'MEDIUM';
      reasons.push(`Moderate volatility of ${data.volatility.toFixed(1)}%`);
    } else if (data.volatility > 50) {
      score -= 20;
      riskLevel = 'HIGH';
      reasons.push(`High volatility of ${data.volatility.toFixed(1)}% indicates significant risk`);
    } else {
      score -= 10;
      riskLevel = 'HIGH';
      reasons.push(`Elevated volatility of ${data.volatility.toFixed(1)}%`);
    }
  }

  // Max Drawdown Analysis (weight: 30%)
  if (data.maxDrawdown !== undefined && data.maxDrawdown !== null) {
    const absDrawdown = Math.abs(data.maxDrawdown);
    metrics.maxDrawdown = data.maxDrawdown;
    confidence += 30;

    if (absDrawdown < 15) {
      score += 15;
      reasons.push(`Small max drawdown of ${absDrawdown.toFixed(1)}%`);
    } else if (absDrawdown < 30) {
      score += 5;
    } else if (absDrawdown > 50) {
      score -= 15;
      if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
      reasons.push(`Large max drawdown of ${absDrawdown.toFixed(1)}% shows downside risk`);
    }
  }

  // Beta Analysis (weight: 20%)
  if (data.beta !== undefined && data.beta !== null) {
    metrics.beta = data.beta;
    confidence += 20;

    if (data.beta < 0.8) {
      score += 10;
      reasons.push(`Low beta of ${data.beta.toFixed(2)} - less market sensitive`);
    } else if (data.beta > 1.5) {
      score -= 10;
      reasons.push(`High beta of ${data.beta.toFixed(2)} - high market sensitivity`);
    }
  }

  // 52-Week Range Analysis (weight: 10%)
  if (data.high52W && data.low52W && data.currentPrice) {
    const range = data.high52W - data.low52W;
    const positionInRange = ((data.currentPrice - data.low52W) / range) * 100;

    metrics.positionIn52WRange = positionInRange;
    confidence += 15;

    if (positionInRange > 80) {
      score -= 8;
      reasons.push(`Trading near 52-week high - limited upside, increased downside risk`);
    } else if (positionInRange < 20) {
      score += 8;
      reasons.push(`Trading near 52-week low - potential recovery opportunity`);
    }
  }

  // Ensure score and confidence are in valid ranges
  score = Math.max(0, Math.min(100, score));
  confidence = Math.min(100, confidence);

  // Determine final risk level based on score
  if (score > 70) {
    riskLevel = 'LOW';
  } else if (score > 40) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  return {
    score,
    confidence,
    reasoning: reasons.length > 0 ? reasons.join('. ') : 'Insufficient data for risk assessment',
    metrics,
    riskLevel,
  };
}
