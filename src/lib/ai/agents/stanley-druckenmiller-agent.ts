/**
 * Stanley Druckenmiller Agent - Macro Legend
 * Hunts for asymmetric opportunities with macro tailwinds.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface StanleyDruckenmillerResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runStanleyDruckenmillerAgent(marketData: MarketData): Promise<StanleyDruckenmillerResult> {
  const beta = marketData.beta || 1;
  const revenueGrowth = marketData.revenueGrowth || 0;
  const earningsGrowth = marketData.earningsGrowth || 0;
  
  // Druckenmiller likes growth with momentum
  const hasMomentum = earningsGrowth > 15;
  const riskReward = hasMomentum && beta < 1.5 ? 'Favorable' : 'Uncertain';
  
  const quantSummary = `
STANLEY DRUCKENMILLER ANALYSIS:
- Beta: ${beta.toFixed(2)} (${beta > 1.2 ? 'High Volatility' : 'Manageable'})
- Revenue Growth: ${revenueGrowth.toFixed(1)}%
- Earnings Growth: ${earningsGrowth.toFixed(1)}%
- Asymmetric Setup: ${riskReward}
`;

  const prompt = `You are Stanley Druckenmiller, legendary macro investor who generated 30% annual returns at Duquesne Capital.

Analyze ${marketData.ticker} with your macro-driven, momentum-aware investment approach:

**Your Investment Philosophy:**
1. MACRO IS KING - Don't fight the Fed, anticipate their moves
2. Look for asymmetric risk/reward - limited downside, massive upside potential
3. "The way to build long-term returns is through preservation of capital and home runs"
4. When you have conviction, SIZE the position aggressively
5. Cut losses quickly, let winners run
6. Follow earnings momentum and liquidity cycles

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Macro Environment**: Is the current macro environment favorable for this sector? Fed policy, liquidity, cycle positioning?
2. **Earnings Momentum**: Is this company in an earnings acceleration phase? Positive revisions?
3. **Asymmetric Setup**: What's the risk/reward? Is the downside limited and upside significant?
4. **Position Sizing**: If bullish, would you take a large concentrated position or stay small?

**SIGNAL RULES:**
- BULLISH: Favorable macro, strong earnings momentum, limited downside = Bet big
- BEARISH: Macro headwinds, earnings decelerating, high valuation = Avoid or short
- NEUTRAL: Mixed signals, unclear macro setup = Wait for better entry

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Stanley Druckenmiller's decisive, macro-focused style. Discuss the macro setup, earnings momentum, and whether this is a conviction bet or one to avoid."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 4000,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'StanleyDruckenmiller');

  return {
    agentName: 'StanleyDruckenmiller',
    analysis: `### Stanley Druckenmiller Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
