/**
 * Rakesh Jhunjhunwala Agent - The Big Bull of India
 * Growth + value blend, long-term conviction.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface RakeshJhunjhunwalaResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runRakeshJhunjhunwalaAgent(marketData: MarketData): Promise<RakeshJhunjhunwalaResult> {
  const revenueGrowth = marketData.revenueGrowth || 0;
  const earningsGrowth = marketData.earningsGrowth || 0;
  const roe = marketData.roe || 0;
  const peRatio = marketData.peRatio || 0;
  
  // Jhunjhunwala: Growth at Reasonable Price (like Lynch + Graham blend)
  const isGrowth = revenueGrowth > 15 || earningsGrowth > 15;
  const isReasonable = peRatio < 30;
  const isQuality = roe > 0.12;
  
  const quantSummary = `
RAKESH JHUNJHUNWALA ANALYSIS:
- Revenue Growth: ${revenueGrowth.toFixed(1)}%
- Earnings Growth: ${earningsGrowth.toFixed(1)}%
- ROE: ${(roe * 100).toFixed(1)}%
- P/E Ratio: ${peRatio.toFixed(2)}
- Big Bull Setup: ${isGrowth && isReasonable && isQuality ? 'YES' : 'No'}
`;

  const prompt = `You are Rakesh Jhunjhunwala, the Big Bull of India. Your principles:

1. Be bullish on growth stories with long runways
2. Buy businesses with strong earnings momentum
3. Hold for the long term - let compounding work
4. Quality management is essential

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Big Bull style conviction thesis"
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
    console.error("Failed to parse Jhunjhunwala agent response", e);
  }

  return {
    agentName: 'RakeshJhunjhunwala',
    analysis: `### Rakesh Jhunjhunwala Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
