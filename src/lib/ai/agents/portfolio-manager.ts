/**
 * Portfolio Manager Agent - Uses Claude (Anthropic) for final synthesis
 * Combines all agent analyses into a coherent investment recommendation
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  MarketData,
  ValuationResult,
  SentimentResult,
  FundamentalResult,
  RiskResult,
  PortfolioManagerResult,
} from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PORTFOLIO_MANAGER_PROMPT = `You are an experienced portfolio manager synthesizing multiple expert analyses to make final investment decisions.

Your role is to:
1. Review and weigh the insights from specialist analysts (Valuation, Sentiment, Fundamental, Risk)
2. Identify areas of agreement and disagreement between analyses
3. Make a clear investment recommendation (BUY, HOLD, or SELL)
4. Provide a confidence score (0-100) for your recommendation
5. Set a realistic target price and time horizon
6. Summarize key takeaways for investors

Decision Framework:
- BUY: Strong fundamentals + attractive valuation + acceptable risk + positive catalysts
- HOLD: Mixed signals, fairly valued, or awaiting catalyst
- SELL: Overvalued, deteriorating fundamentals, high risk, or better opportunities elsewhere

Provide a comprehensive final report including:
- Clear investment recommendation with confidence score
- Target price and time horizon (e.g., "12-month target")
- Top 3-5 key takeaways (why this recommendation?)
- Risk-reward profile summary
- What would change your thesis? (what to watch)

Be decisive but acknowledge uncertainties. Think like a professional portfolio manager making real decisions.`;

export async function runPortfolioManager(
  marketData: MarketData,
  valuationResult: ValuationResult,
  sentimentResult: SentimentResult,
  fundamentalResult: FundamentalResult,
  riskResult: RiskResult
): Promise<PortfolioManagerResult> {
  const startTime = Date.now();

  try {
    const agentSummaries = `
VALUATION ANALYSIS (${valuationResult.agentName}):
${valuationResult.analysis}

Key Metrics:
- Intrinsic Value: $${valuationResult.intrinsicValue || 'N/A'}
- Target Price: $${valuationResult.targetPrice || 'N/A'}
- Upside: ${valuationResult.upside ? valuationResult.upside.toFixed(1) + '%' : 'N/A'}

---

SENTIMENT ANALYSIS (${sentimentResult.agentName}):
${sentimentResult.analysis}

Overall Sentiment: ${sentimentResult.overallSentiment}
Sentiment Score: ${sentimentResult.sentimentScore}

---

FUNDAMENTAL ANALYSIS (${fundamentalResult.agentName}):
${fundamentalResult.analysis}

Financial Health: ${fundamentalResult.financialHealth}
Growth Potential: ${fundamentalResult.growthPotential}

---

RISK ANALYSIS (${riskResult.agentName}):
${riskResult.analysis}

Risk Level: ${riskResult.riskLevel}
Key Risk Factors:
${riskResult.riskFactors.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2500,
      temperature: 0.4,
      messages: [
        {
          role: 'user',
          content: `${PORTFOLIO_MANAGER_PROMPT}\n\nStock: ${marketData.ticker}\nCurrent Price: $${marketData.currentPrice}\n\nReview the following analyst reports and provide your final investment recommendation:\n\n${agentSummaries}`,
        },
      ],
    });

    const finalReport = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse recommendation and confidence
    const recommendationMatch = finalReport.match(/recommendation[:\s]+(BUY|HOLD|SELL)/i);
    const confidenceMatch = finalReport.match(/confidence[:\s]+(\d+)/i);
    const targetPriceMatch = finalReport.match(/target price[:\s]+\$?([\d,.]+)/i);
    const timeHorizonMatch = finalReport.match(/time horizon[:\s]+([^\n]+)/i);

    const recommendation = recommendationMatch
      ? (recommendationMatch[1].toUpperCase() as 'BUY' | 'HOLD' | 'SELL')
      : 'HOLD';
    const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
    const targetPrice = targetPriceMatch
      ? parseFloat(targetPriceMatch[1].replace(/,/g, ''))
      : valuationResult.targetPrice;
    const timeHorizon = timeHorizonMatch ? timeHorizonMatch[1].trim() : '12 months';

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
