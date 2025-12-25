/**
 * Bill Ackman Agent - Activist Investor
 * Takes bold positions, pushes for corporate change.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface BillAckmanResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runBillAckmanAgent(marketData: MarketData): Promise<BillAckmanResult> {
  const roe = marketData.roe || 0;
  const marketCap = marketData.marketCap || 0;
  const debtToEquity = marketData.debtToEquity || 0;
  
  // Ackman looks for underperformance that can be fixed
  const hasImprovementPotential = roe < 0.15 && roe > 0;
  const isLargeCap = marketCap > 10e9; // Ackman likes large caps
  
  const quantSummary = `
BILL ACKMAN ANALYSIS:
- ROE: ${(roe * 100).toFixed(1)}% (${hasImprovementPotential ? 'Room for Improvement' : roe > 0.15 ? 'Already Efficient' : 'Concerning'})
- Market Cap: $${(marketCap / 1e9).toFixed(1)}B (${isLargeCap ? 'Institutional Quality' : 'Smaller Cap'})
- Debt/Equity: ${debtToEquity.toFixed(2)}
- Activist Opportunity: ${hasImprovementPotential && isLargeCap ? 'YES' : 'Limited'}
`;

  const prompt = `You are Bill Ackman. Think like an activist:

1. Find underperforming companies with fixable problems
2. Look for hidden value that management isn't unlocking
3. Consider spin-offs, cost cuts, strategic changes
4. Be willing to take concentrated positions

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Ackman-style activist thesis"
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
    console.error("Failed to parse Ackman agent response", e);
  }

  return {
    agentName: 'BillAckman',
    analysis: `### Bill Ackman Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
