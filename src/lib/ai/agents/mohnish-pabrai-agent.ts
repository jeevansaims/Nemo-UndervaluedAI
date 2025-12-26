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

IMPORTANT JSON FORMATTING RULES:
- Your response must be valid JSON that can be parsed by JSON.parse()
- In the reasoning field, replace ALL newlines with spaces (write as one continuous paragraph)
- Do NOT use quotes within the reasoning text - use 'single quotes' or rephrase
- Escape any special characters properly

Return ONLY valid JSON with this structure (no markdown, no code blocks):
{
  "signal": "Bullish or Bearish or Neutral",
  "confidence": 75,
  "reasoning": "Write 300+ words of detailed analysis in one continuous paragraph with spaces instead of newlines. Cover: (1) Downside Protection - analyze P/B ${pbRatio.toFixed(2)} and D/E ${debtToEquity.toFixed(2)} for worst-case scenario (2) Upside Potential - evaluate ROE ${(roe * 100).toFixed(1)}% for potential returns if thesis plays out (3) Dhandho Test - assess whether this is truly 'heads I win tails I do not lose much' (4) Portfolio Fit - determine if this merits a concentrated 10%+ position. Use 'single quotes' for emphasis. Apply your practical Dhandho framework and no-brainer investment criteria."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
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
