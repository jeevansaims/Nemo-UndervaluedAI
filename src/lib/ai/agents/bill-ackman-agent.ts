/**
 * Bill Ackman Agent - Activist Investor
 * Takes bold positions, pushes for corporate change.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

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

  const prompt = `You are Bill Ackman, activist investor and founder of Pershing Square Capital.

Analyze ${marketData.ticker} using your activist investment approach:

**Your Investment Philosophy:**
1. Find underperforming companies with FIXABLE problems
2. Look for hidden value that incumbent management isn't unlocking
3. Concentrate heavily - 8-12 positions maximum
4. Push for catalysts: spin-offs, cost cuts, strategic changes, new management
5. Target large-cap, liquid stocks where you can build meaningful positions
6. Be willing to make public campaigns when management resists

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Operational Assessment**: Is there room to improve margins, cut costs, or optimize the business?
2. **Activist Opportunity**: What specific changes would unlock value? New management, spin-off, cost cuts?
3. **Catalyst Path**: How would you create value here? What's the timeline?
4. **Risk/Reward**: Is this worth a concentrated position? What's the downside?

**SIGNAL RULES:**
- BULLISH: Underperforming vs. peers, clear fix, large-cap liquid = Activist target
- BEARISH: Already optimized, small cap, or structural decline = Pass
- NEUTRAL: Some potential but unclear path to change

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Bill Ackman's confident, analytical style. Discuss what's wrong with the company, how you'd fix it, and whether it's worth a concentrated position."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'BillAckman');

  return {
    agentName: 'BillAckman',
    analysis: `### Bill Ackman Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
