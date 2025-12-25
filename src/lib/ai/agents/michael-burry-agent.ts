/**
 * Michael Burry Agent - The Big Short Contrarian
 * Hunts for deep value, market mispricing, and asymmetric bets.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MichaelBurryResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runMichaelBurryAgent(marketData: MarketData): Promise<MichaelBurryResult> {
  const pbRatio = marketData.pbRatio || 0;
  const peRatio = marketData.peRatio || 0;
  const freeCashFlow = marketData.freeCashFlow || 0;
  const marketCap = marketData.marketCap || 1;
  
  // Burry's focus: Asset value vs market price
  const fcfYield = freeCashFlow / marketCap;
  const isDeepValue = pbRatio < 1 && peRatio < 10;
  
  const quantSummary = `
MICHAEL BURRY ANALYSIS:
- P/B Ratio: ${pbRatio.toFixed(2)} (${pbRatio < 1 ? 'Below Book Value!' : 'Above Book'})
- P/E Ratio: ${peRatio.toFixed(2)}
- FCF Yield: ${(fcfYield * 100).toFixed(2)}%
- Deep Value Candidate: ${isDeepValue ? 'YES' : 'No'}
`;

  const prompt = `You are Michael Burry. Think like a contrarian:

1. Look where others aren't looking
2. Find catalysts for value realization
3. Be willing to be early (painfully early)
4. Focus on asset values and cash flows

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Burry-style contrarian thesis"
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
    console.error("Failed to parse Burry agent response", e);
  }

  return {
    agentName: 'MichaelBurry',
    analysis: `### Michael Burry Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Deep Value Check:** P/B: ${pbRatio.toFixed(2)}, FCF Yield: ${(fcfYield*100).toFixed(2)}%`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
