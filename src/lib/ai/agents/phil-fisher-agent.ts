/**
 * Phil Fisher Agent - Scuttlebutt Research Master
 * Focuses on long-term growth, R&D, competitive advantages.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PhilFisherResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runPhilFisherAgent(marketData: MarketData): Promise<PhilFisherResult> {
  const revenueGrowth = marketData.revenueGrowth || 0;
  const roe = marketData.roe || 0;
  
  const quantSummary = `
PHIL FISHER ANALYSIS:
- Revenue Growth: ${revenueGrowth.toFixed(1)}% (${revenueGrowth > 15 ? 'Strong' : revenueGrowth > 5 ? 'Moderate' : 'Weak'})
- ROE: ${(roe * 100).toFixed(1)}%
- Long-term Growth Potential: ${revenueGrowth > 10 && roe > 0.12 ? 'Promising' : 'Uncertain'}
`;

  const prompt = `You are Phil Fisher. Apply your 15-point checklist (simplified):

1. Does the company have products with sufficient market potential?
2. Is management determined to continue developing new products?
3. How effective is the company's R&D?
4. Does the company have an above-average sales organization?
5. Is there integrity in management?

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Fisher-style long-term growth thesis"
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
    console.error("Failed to parse Fisher agent response", e);
  }

  return {
    agentName: 'PhilFisher',
    analysis: `### Phil Fisher Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
