/**
 * Mohnish Pabrai Agent - The Dhandho Investor
 * Low risk, high uncertainty = potential doubles.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

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

  const prompt = `You are Mohnish Pabrai, author of "The Dhandho Investor" and managing partner of Pabrai Investment Funds.

Analyze ${marketData.ticker} using your Dhandho investment framework:

**Your Dhandho Philosophy (from Indian entrepreneurs):**
1. "Heads I win, tails I don't lose much" - asymmetric risk/reward is everything
2. FEW bets, BIG bets, INFREQUENT bets - concentrated portfolio
3. Clone shamelessly - copy great investors' best ideas
4. Look for LOW-RISK, HIGH-UNCERTAINTY situations (not high-risk!)
5. Invest in simple, understandable businesses
6. The best investments are "no brainers" with obvious value

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Downside Protection**: What's the worst case? Is the downside limited by assets, cash, or business stability?
2. **Upside Potential**: If things go right, what's the potential return? 2x? 5x? 10x?
3. **Dhandho Test**: Is this truly "heads I win, tails I don't lose much"?
4. **Portfolio Fit**: Would you make this a significant position (10%+)?

**SIGNAL RULES:**
- BULLISH: Clear downside protection, significant upside potential, simple business = Classic Dhandho
- BEARISH: High downside risk, limited upside, complex or declining business = Avoid
- NEUTRAL: Some appeal but not a "no brainer" - keep on watchlist

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Mohnish Pabrai's clear, practical Dhandho style. Discuss the risk/reward asymmetry and whether this meets your strict criteria for a concentrated bet."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 8192,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'MohnishPabrai');

  return {
    agentName: 'MohnishPabrai',
    analysis: `### Mohnish Pabrai Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Dhandho Check:** ${isDhandho ? '✅ Favorable' : '❌ Not Ideal'}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
