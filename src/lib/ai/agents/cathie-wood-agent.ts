/**
 * Cathie Wood Agent - Queen of Growth/Innovation Investing
 * Focuses on disruptive innovation, TAM expansion, exponential growth.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CathieWoodResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runCathieWoodAgent(marketData: MarketData): Promise<CathieWoodResult> {
  const revenueGrowth = marketData.revenueGrowth || 0;
  const earningsGrowth = marketData.earningsGrowth || 0;
  
  // Cathie loves high growth, even at high valuations
  const isHighGrowth = revenueGrowth > 20 || earningsGrowth > 30;
  const growthScore = (revenueGrowth + earningsGrowth) / 2;
  
  const quantSummary = `
CATHIE WOOD ANALYSIS:
- Revenue Growth: ${revenueGrowth.toFixed(1)}%
- Earnings Growth: ${earningsGrowth.toFixed(1)}%
- Growth Score: ${growthScore.toFixed(1)}%
- Disruptive Potential: ${isHighGrowth ? 'High' : 'Moderate/Low'}
`;

  const prompt = `You are Cathie Wood. Think about disruptive innovation:

1. Is this company riding an exponential technology curve?
2. What's the Total Addressable Market (TAM) potential?
3. Innovation beats valuation - 5-year horizon
4. Look for convergence of multiple technologies

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Cathie-style innovation thesis"
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
    console.error("Failed to parse Wood agent response", e);
  }

  return {
    agentName: 'CathieWood',
    analysis: `### Cathie Wood Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Growth Score:** ${growthScore.toFixed(1)}%`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
