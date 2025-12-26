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
  WarrenBuffettResult, // [NEW]
} from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PORTFOLIO_MANAGER_PROMPT = `You are an experienced portfolio manager synthesizing multiple expert analyses to make final investment decisions.

You are reviewing analyses from 20 specialist agents:

FUNCTIONAL AGENTS:
1. Valuation Agent - Intrinsic value and price targets
2. Sentiment Agent - News and market sentiment
3. Fundamental Agent - Financial health and growth
4. Risk Agent - Risk factors and levels
5. Technical Agent - Price momentum and patterns
6. Peer Comparison Agent - Relative valuation vs competitors
7. Macro Agent - Economic and sector context
8. Earnings Call Agent - Management tone and guidance

PERSONA AGENTS (Famous Investors):
9. Warren Buffett - Seeks wonderful companies at fair prices
10. Ben Graham - Deep value with margin of safety
11. Charlie Munger - Quality businesses at fair prices
12. Peter Lynch - Ten-baggers in everyday businesses
13. Michael Burry - Contrarian deep value
14. Cathie Wood - Disruptive innovation
15. Bill Ackman - Activist investing
16. Phil Fisher - Scuttlebutt research
17. Stanley Druckenmiller - Macro asymmetric bets
18. Aswath Damodaran - DCF valuation expert
19. Mohnish Pabrai - Dhandho low-risk high-reward
20. Rakesh Jhunjhunwala - Growth at reasonable price

Your role is to:
1. Review and weigh all 9 specialist analyses
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
  earningsCallResult?: EarningsCallResult,
  personaResults?: Record<string, any>
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
Signal: ${technicalResult.signal}
`;
    }
    
    if (earningsCallResult) {
      agentSummaries += `
---

EARNINGS CALL ANALYSIS:
${earningsCallResult.analysis}
`;
    }
    
    if (peerComparisonResult) {
      agentSummaries += `
---

PEER COMPARISON:
${peerComparisonResult.analysis}
`;
    }
    
    if (macroResult) {
      agentSummaries += `
---

MACRO CONTEXT:
${macroResult.analysis}
`;
    }

    agentSummaries += `
---

PERSONA AGENT SUMMARIES:
`;

    // Add persona agent summaries if available
    if (personaResults) {
      Object.entries(personaResults).forEach(([name, result]) => {
        const signal = (result as any).signal || 'Neutral';
        const confidence = (result as any).confidence || 0;
        agentSummaries += `- ${name}: ${signal} (${confidence}% confidence)\n`;
      });
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for now (Sonnet models not available)
      max_tokens: 5000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${PORTFOLIO_MANAGER_PROMPT}\n\nReview the following agent analyses and provide your portfolio management decision along with a concrete TRADE SETUP:\n\n${agentSummaries}`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse main fields
    const recommendationMatch = analysis.match(/Recommendation:? (BUY|HOLD|SELL)/i);
    const confidenceMatch = analysis.match(/Confidence:? (\d+)/i);
    const targetPriceMatch = analysis.match(/Target Price:? \$?([\d,.]+)/i);
    const timeHorizonMatch = analysis.match(/Time Horizon:? ([^\n]+)/i);

    const recommendation = recommendationMatch
      ? (recommendationMatch[1].toUpperCase() as 'BUY' | 'SELL' | 'HOLD')
      : 'HOLD';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
    const targetPrice = targetPriceMatch ? parseFloat(targetPriceMatch[1].replace(/,/g, '')) : undefined;
    const timeHorizon = timeHorizonMatch ? timeHorizonMatch[1].trim() : '12 months';

    // NEW: Parse Trade Setup
    const entryMatch = analysis.match(/Entry Price:? \$?([\d,.]+)/i);
    const stopLossMatch = analysis.match(/Stop Loss:? \$?([\d,.]+)/i);
    const tradeTargetMatch = analysis.match(/Trade Target:? \$?([\d,.]+)/i);

    let tradeSetup: any = undefined;

    if (stopLossMatch && tradeTargetMatch) {
      const entry = entryMatch ? parseFloat(entryMatch[1].replace(/,/g, '')) : marketData.currentPrice;
      const stop = parseFloat(stopLossMatch[1].replace(/,/g, ''));
      const target = parseFloat(tradeTargetMatch[1].replace(/,/g, ''));

      const upside = ((target - entry) / entry) * 100;
      const downside = ((entry - stop) / entry) * 100;
      const riskReward = downside !== 0 ? Math.abs(upside / downside) : 0;

      tradeSetup = {
        suggestedAction: recommendation,
        entryPrice: entry,
        targetPrice: target,
        stopLoss: stop,
        riskRewardRatio: parseFloat(riskReward.toFixed(2)),
        upside: parseFloat(upside.toFixed(2)),
        downside: parseFloat(downside.toFixed(2)),
        reasoning: "Synthesized from Technical Support/Resistance and Volatility Analysis."
      };
    }

    // Extract key takeaways
    const keyTakeaways = analysis
      .split(/Key Takeaways:?/i)[1]
      ?.split('\n')
      .filter(line => line.trim().match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5) || [];

    return {
      timestamp: new Date(),
      rating: recommendation,
      confidence: confidence,
      summary: analysis.split('Key Takeaways')[0].trim(),
      analysis: analysis,
      targetPrice: targetPrice,
      timeHorizon: timeHorizon,
      riskLevel: riskResult.riskLevel,
      investmentThesis: keyTakeaways,
      catalysts: [],
      riskFactors: riskResult.riskFactors,
      tradeSetup: tradeSetup
    };
  } catch (error) {
    console.error('Portfolio manager error:', error);
    throw new Error(`Portfolio manager analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
