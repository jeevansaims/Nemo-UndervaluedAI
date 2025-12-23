import type {
  MarketData,
  ValuationAnalysis,
  RiskAnalysis,
  TechnicalAnalysis,
  PortfolioDecision,
} from './types';

/**
 * Portfolio Manager Agent
 *
 * Makes final BUY/SELL/HOLD decision by synthesizing all agent analyses.
 * Weighs different factors and calculates overall confidence.
 */
export async function makePortfolioDecision(
  data: MarketData,
  valuation: ValuationAnalysis,
  risk: RiskAnalysis,
  technical: TechnicalAnalysis
): Promise<PortfolioDecision> {
  // Weight each agent's contribution
  const weights = {
    valuation: 0.40,  // 40% - Most important for undervalued stocks
    risk: 0.30,       // 30% - Risk management is crucial
    technical: 0.20,  // 20% - Momentum and timing
    quality: 0.10,    // 10% - Overall quality bonus
  };

  // Calculate weighted score
  let totalScore = 0;
  let totalWeight = 0;

  // Valuation contribution
  totalScore += valuation.score * valuation.confidence / 100 * weights.valuation;
  totalWeight += weights.valuation * valuation.confidence / 100;

  // Risk contribution (we want LOW risk, so invert if needed)
  // High risk score = low risk, so we keep it as is
  totalScore += risk.score * risk.confidence / 100 * weights.risk;
  totalWeight += weights.risk * risk.confidence / 100;

  // Technical contribution
  totalScore += technical.score * technical.confidence / 100 * weights.technical;
  totalWeight += weights.technical * technical.confidence / 100;

  // Quality bonus - if company has good fundamentals
  if (data.roe && data.roe > 15 && data.netMargin && data.netMargin > 10) {
    totalScore += 80 * weights.quality;
    totalWeight += weights.quality;
  }

  // Normalize score to 0-100 range
  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 50;

  // Calculate overall confidence (average of agent confidences)
  const avgConfidence = (
    valuation.confidence * weights.valuation +
    risk.confidence * weights.risk +
    technical.confidence * weights.technical
  ) / (weights.valuation + weights.risk + weights.technical);

  // Make recommendation based on final score
  let recommendation: 'BUY' | 'SELL' | 'HOLD';
  let targetPrice: number | undefined;

  if (finalScore >= 70) {
    recommendation = 'BUY';
  } else if (finalScore <= 35) {
    recommendation = 'SELL';
  } else {
    recommendation = 'HOLD';
  }

  // Calculate target price
  if (valuation.intrinsicValue) {
    targetPrice = valuation.intrinsicValue;
  } else if (data.currentPrice && data.pe) {
    // Fallback: adjust current price based on score
    const priceAdjustment = (finalScore - 50) / 100; // -0.5 to +0.5
    targetPrice = data.currentPrice * (1 + priceAdjustment);
  }

  // Build comprehensive reasoning
  const reasoningParts: string[] = [];

  // Add recommendation context
  if (recommendation === 'BUY') {
    reasoningParts.push(`STRONG BUY recommendation with ${finalScore.toFixed(0)}% overall score.`);
  } else if (recommendation === 'SELL') {
    reasoningParts.push(`SELL recommendation with ${finalScore.toFixed(0)}% overall score.`);
  } else {
    reasoningParts.push(`HOLD recommendation with ${finalScore.toFixed(0)}% overall score.`);
  }

  // Add valuation reasoning
  if (valuation.reasoning) {
    reasoningParts.push(`\n\nVALUATION (${valuation.score.toFixed(0)}/100): ${valuation.reasoning}`);
  }

  // Add risk reasoning
  if (risk.reasoning) {
    reasoningParts.push(`\n\nRISK (${risk.score.toFixed(0)}/100 - ${risk.riskLevel}): ${risk.reasoning}`);
  }

  // Add technical reasoning
  if (technical.reasoning) {
    reasoningParts.push(`\n\nTECHNICALS (${technical.score.toFixed(0)}/100 - ${technical.trend}): ${technical.reasoning}`);
  }

  // Add upside potential if available
  if (valuation.upside) {
    reasoningParts.push(`\n\nESTIMATED UPSIDE: ${valuation.upside.toFixed(1)}%`);
  }

  // Add key risk factors
  if (risk.riskLevel === 'HIGH') {
    reasoningParts.push('\n\n⚠️ WARNING: HIGH RISK PROFILE - Use caution and appropriate position sizing.');
  }

  return {
    recommendation,
    targetPrice,
    confidence: Math.round(avgConfidence),
    reasoning: reasoningParts.join(''),
    valuationScore: Math.round(valuation.score),
    sentimentScore: 50, // Placeholder - we don't have sentiment yet
    riskScore: Math.round(risk.score),
    technicalScore: Math.round(technical.score),
  };
}
