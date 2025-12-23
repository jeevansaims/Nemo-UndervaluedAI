import type { MarketData, TechnicalAnalysis } from './types';

/**
 * Technical Analysis Agent
 *
 * Analyzes price momentum and trends:
 * - 52-week performance
 * - Current position vs highs/lows
 * - Momentum indicators
 */
export async function analyzeTechnicals(data: MarketData): Promise<TechnicalAnalysis> {
  const metrics: Record<string, any> = {};
  let score = 50; // neutral starting point
  let confidence = 0;
  const reasons: string[] = [];
  let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';

  // 52-Week Performance (weight: 40%)
  if (data.priceChange52W !== undefined && data.priceChange52W !== null) {
    metrics.priceChange52W = data.priceChange52W;
    confidence += 35;

    if (data.priceChange52W > 20) {
      score += 20;
      trend = 'BULLISH';
      reasons.push(`Strong 52-week gain of ${data.priceChange52W.toFixed(1)}%`);
    } else if (data.priceChange52W > 5) {
      score += 10;
      trend = 'BULLISH';
      reasons.push(`Positive 52-week gain of ${data.priceChange52W.toFixed(1)}%`);
    } else if (data.priceChange52W < -20) {
      score -= 20;
      trend = 'BEARISH';
      reasons.push(`Significant 52-week decline of ${Math.abs(data.priceChange52W).toFixed(1)}%`);
    } else if (data.priceChange52W < -5) {
      score -= 10;
      trend = 'BEARISH';
      reasons.push(`Negative 52-week performance of ${data.priceChange52W.toFixed(1)}%`);
    } else {
      trend = 'NEUTRAL';
      reasons.push('Sideways movement over past year');
    }
  }

  // Position in 52-Week Range (weight: 35%)
  if (data.high52W && data.low52W && data.currentPrice) {
    const range = data.high52W - data.low52W;
    const positionInRange = ((data.currentPrice - data.low52W) / range) * 100;
    const distanceFromHigh = ((data.high52W - data.currentPrice) / data.currentPrice) * 100;

    metrics.positionIn52WRange = positionInRange;
    metrics.distanceFromHigh = distanceFromHigh;
    confidence += 35;

    if (positionInRange > 80) {
      score += 15;
      if (trend !== 'BEARISH') trend = 'BULLISH';
      reasons.push(`Trading at ${positionInRange.toFixed(0)}% of 52-week range - strong momentum`);
    } else if (positionInRange > 60) {
      score += 8;
    } else if (positionInRange < 20) {
      score -= 15;
      if (trend !== 'BULLISH') trend = 'BEARISH';
      reasons.push(`Trading at only ${positionInRange.toFixed(0)}% of 52-week range - weak momentum`);
    } else if (positionInRange < 40) {
      score -= 8;
    }

    // Recovery potential if near lows
    if (positionInRange < 30 && data.priceChange52W !== undefined && data.priceChange52W > -10) {
      score += 8;
      reasons.push('Potential reversal opportunity near lows');
    }
  }

  // Momentum Quality Check (weight: 25%)
  // If price is up but with high volatility, reduce score
  if (data.priceChange52W !== undefined && data.volatility !== undefined) {
    const momentumQuality = data.priceChange52W / (data.volatility + 1);
    metrics.momentumQuality = momentumQuality;
    confidence += 30;

    if (momentumQuality > 1.5) {
      score += 10;
      reasons.push('High-quality momentum with controlled volatility');
    } else if (momentumQuality < -1.5) {
      score -= 10;
      reasons.push('Negative momentum with high volatility');
    }
  }

  // Ensure score and confidence are in valid ranges
  score = Math.max(0, Math.min(100, score));
  confidence = Math.min(100, confidence);

  return {
    score,
    confidence,
    reasoning: reasons.length > 0 ? reasons.join('. ') : 'Insufficient data for technical analysis',
    metrics,
    trend,
  };
}
