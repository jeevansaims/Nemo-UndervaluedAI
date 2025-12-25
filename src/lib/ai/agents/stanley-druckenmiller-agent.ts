/**
 * Stanley Druckenmiller Agent - Macro Legend
 * Hunts for asymmetric opportunities with macro tailwinds.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

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

  const prompt = `You are Stanley Druckenmiller. Think macro-first:

1. What's the big picture economic environment?
2. Is this stock positioned to benefit from macro trends?
3. Look for asymmetric risk/reward - limited downside, large upside
4. Don't fight the Fed, but anticipate their moves

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Druckenmiller-style macro thesis"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  let result = { signal: 'Neutral', confidence: 50, reasoning: 'Analysis incomplete' };
  
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) result = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse Druckenmiller agent response", e);
  }

  return {
    agentName: 'StanleyDruckenmiller',
    analysis: `### Stanley Druckenmiller Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
