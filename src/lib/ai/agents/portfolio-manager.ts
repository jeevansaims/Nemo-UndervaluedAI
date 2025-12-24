/**
 * Portfolio Manager Agent - Uses Claude (Anthropic) for final synthesis
 * Combines all 8 agent analyses into a coherent investment recommendation
 * Updated to match undervalued.ai's 7-dimensional methodology
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  MarketData,
  ValuationResult,
  SentimentResult,
  FundamentalResult,
  RiskResult,
  TechnicalResult,
  PeerComparisonResult,
  MacroResult,
  EarningsCallResult,
  PortfolioManagerResult,
} from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PORTFOLIO_MANAGER_PROMPT = `You are an experienced portfolio manager synthesizing multiple expert analyses to make final investment decisions.

You are reviewing analyses from 8 specialist agents:
1. Valuation Agent - Intrinsic value and price targets
2. Sentiment Agent - News and market sentiment
3. Fundamental Agent - Financial health and growth
4. Risk Agent - Risk factors and levels
5. Technical Agent - Price momentum and patterns
6. Peer Comparison Agent - Relative valuation vs competitors
7. Macro Agent - Economic and sector context
8. Earnings Call Agent - Management tone and guidance

Your role is to:
1. Review and weigh all 8 specialist analyses
2. Identify agreement and disagreement patterns
3. Make a clear investment recommendation (BUY, HOLD, or SELL)
4. Provide a confidence score (0-100) for your recommendation
5. Set a realistic target price and time horizon
6. Summarize key takeaways for investors

Decision Framework:
- BUY: Strong fundamentals + attractive valuation + acceptable risk + positive technicals + favorable macro
- HOLD: Mixed signals, fairly valued, or awaiting catalyst
- SELL: Overvalued, deteriorating fundamentals, high risk, or macro headwinds

IMPORTANT: Your response must include these exact fields in this format:
- Recommendation: [BUY/HOLD/SELL]
- Confidence: [number from 0-100]
- Target Price: $[amount]
- Time Horizon: [timeframe]

Then provide:
- Top 5 key takeaways (why this recommendation?)
- Risk-reward profile summary
- What would change your thesis?

Be decisive but acknowledge uncertainties. Think like a professional portfolio manager.`;

export async function runPortfolioManager(
  marketData: MarketData,
  valuationResult: ValuationResult,
  sentimentResult: SentimentResult,
  fundamentalResult: FundamentalResult,
  riskResult: RiskResult,
  technicalResult?: TechnicalResult,
  peerComparisonResult?: PeerComparisonResult,
  macroResult?: MacroResult,
  earningsCallResult?: EarningsCallResult
): Promise<PortfolioManagerResult> {
  try {
    let agentSummaries = `
VALUATION ANALYSIS:
${valuationResult.analysis}
Key Metrics:
- Intrinsic Value: $${valuationResult.intrinsicValue || 'N/A'}
- Target Price: $${valuationResult.targetPrice || 'N/A'}
- Upside: ${valuationResult.upside ? valuationResult.upside.toFixed(1) + '%' : 'N/A'}

---

SENTIMENT ANALYSIS:
${sentimentResult.analysis}
Overall Sentiment: ${sentimentResult.overallSentiment}
Sentiment Score: ${sentimentResult.sentimentScore}

---

FUNDAMENTAL ANALYSIS:
${fundamentalResult.analysis}
Financial Health: ${fundamentalResult.financialHealth}
Growth Potential: ${fundamentalResult.growthPotential}

---

RISK ANALYSIS:
${riskResult.analysis}
Risk Level: ${riskResult.riskLevel}
Key Risk Factors: ${riskResult.riskFactors.join(', ')}
`;

    // Add new agent results if available
    if (technicalResult) {
      agentSummaries += `
---

TECHNICAL ANALYSIS:
${technicalResult.analysis}
Trend: ${technicalResult.trend}
Momentum: ${technicalResult.momentum}
Support: $${technicalResult.supportLevel || 'N/A'}
Resistance: $${technicalResult.resistanceLevel || 'N/A'}
`;
    }

    if (peerComparisonResult) {
      agentSummaries += `
---

PEER COMPARISON ANALYSIS:
${peerComparisonResult.analysis}
Relative Valuation: ${peerComparisonResult.relativeValuation}
Competitive Position: ${peerComparisonResult.competitivePosition}
Top Peers: ${peerComparisonResult.topPeers.join(', ')}
`;
    }

    if (macroResult) {
      agentSummaries += `
---

MACRO-ENVIRONMENTAL ANALYSIS:
${macroResult.analysis}
Economic Outlook: ${macroResult.economicOutlook}
Sector Trend: ${macroResult.sectorTrend}
Interest Rate Sensitivity: ${macroResult.interestRateSensitivity}
`;
    }

    if (earningsCallResult) {
      agentSummaries += `
---

EARNINGS CALL ANALYSIS:
${earningsCallResult.analysis}
Management Tone: ${earningsCallResult.managementTone}
Guidance Direction: ${earningsCallResult.guidanceDirection}
Key Themes: ${earningsCallResult.keyThemes.join(', ')}
`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      temperature: 0.4,
      messages: [
        {
          role: 'user',
          content: `${PORTFOLIO_MANAGER_PROMPT}\n\nStock: ${marketData.ticker}\nCurrent Price: $${marketData.currentPrice}\n\nReview the following 8 analyst reports and provide your final investment recommendation:\n\n${agentSummaries}`,
        },
      ],
    });

    const finalReport = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse recommendation and confidence
    const recommendationMatch = finalReport.match(/recommendation[:\s]+(BUY|HOLD|SELL)/i);
    const confidenceMatch = finalReport.match(/confidence(?:\s+score)?[:\s]+(\d+)(?:\/100|%)?/i) ||
                           finalReport.match(/(\d+)(?:\/100|%)?[\s]*confidence/i);
    const targetPriceMatch = finalReport.match(/target(?:\s+price)?[:\s]+\$?([\d,.]+)/i);
    const timeHorizonMatch = finalReport.match(/time\s+horizon[:\s]+([^\n]+)/i);

    const recommendation = recommendationMatch
      ? (recommendationMatch[1].toUpperCase() as 'BUY' | 'HOLD' | 'SELL')
      : 'HOLD';
    const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
    const targetPrice = targetPriceMatch
      ? parseFloat(targetPriceMatch[1].replace(/,/g, ''))
      : valuationResult.targetPrice;
    const timeHorizon = timeHorizonMatch ? timeHorizonMatch[1].trim() : '12 months';

    console.log(`[Portfolio Manager] ${marketData.ticker}: ${recommendation} @ ${confidenceScore}% confidence`);

    // Extract key takeaways
    const keyTakeaways = finalReport
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 15)
      .slice(0, 5);

    return {
      finalReport,
      recommendation,
      confidenceScore,
      targetPrice,
      timeHorizon,
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ['See full report for investment thesis'],
    };
  } catch (error) {
    console.error('Portfolio manager error:', error);
    throw new Error(`Portfolio manager synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
