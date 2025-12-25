/**
 * Mohnish Pabrai Agent - The Dhandho Investor
 * Low risk, high uncertainty = potential doubles.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MohnishPabraiResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runMohnishPabraiAgent(marketData: MarketData): Promise<MohnishPabraiResult> {
  const pbRatio = marketData.pbRatio || 0;
  const roe = marketData.roe || 0;
  const debtToEquity = marketData.debtToEquity || 0;
  
  // Pabrai looks for "heads I win, tails I don't lose much"
  const downsideProtection = pbRatio < 1.5 && debtToEquity < 0.5;
  const upsidePotential = roe > 0.15;
  const isDhandho = downsideProtection && upsidePotential;
  
  const quantSummary = `
MOHNISH PABRAI ANALYSIS:
- P/B Ratio: ${pbRatio.toFixed(2)} (${pbRatio < 1.5 ? 'Good Downside Protection' : 'Limited Protection'})
- Debt/Equity: ${debtToEquity.toFixed(2)} (${debtToEquity < 0.5 ? 'Conservative' : 'Levered'})
- ROE: ${(roe * 100).toFixed(1)}%
- Dhandho Setup: ${isDhandho ? 'YES - Low Risk, High Reward' : 'No'}
`;

  const prompt = `You are Mohnish Pabrai. Apply Dhandho principles:

1. "Heads I win, tails I don't lose much"
2. Few bets, big bets, infrequent bets
3. Clone the best ideas from great investors
4. Look for low-risk, high-uncertainty situations

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Pabrai-style Dhandho thesis"
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
    console.error("Failed to parse Pabrai agent response", e);
  }

  return {
    agentName: 'MohnishPabrai',
    analysis: `### Mohnish Pabrai Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Dhandho Check:** ${isDhandho ? '✅ Favorable' : '❌ Not Ideal'}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
