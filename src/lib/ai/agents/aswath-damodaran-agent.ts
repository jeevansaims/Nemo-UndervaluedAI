/**
 * Aswath Damodaran Agent - The Dean of Valuation
 * Story + Numbers + Disciplined DCF.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';
import { calculateIntrinsicValue } from '../financial-analysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AswathDamodaranResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  intrinsicValue: number;
}

export async function runAswathDamodaranAgent(marketData: MarketData): Promise<AswathDamodaranResult> {
  const history = marketData.financialHistory || [];
  const ivAnalysis = calculateIntrinsicValue(history, marketData.currentPrice);
  
  const marginOfSafety = marketData.marketCap && ivAnalysis.intrinsicValue > 0 
    ? (ivAnalysis.intrinsicValue - marketData.marketCap) / marketData.marketCap 
    : 0;
  
  const quantSummary = `
ASWATH DAMODARAN ANALYSIS:
- Intrinsic Value (DCF): $${(ivAnalysis.intrinsicValue / 1e9).toFixed(2)}B
- Market Cap: $${(marketData.marketCap ? marketData.marketCap / 1e9 : 0).toFixed(2)}B
- Margin of Safety: ${(marginOfSafety * 100).toFixed(1)}%
- Valuation Details: ${ivAnalysis.details.slice(0, 2).join(', ')}
`;

  const prompt = `You are Aswath Damodaran, the "Dean of Valuation" at NYU Stern and author of numerous valuation textbooks.

Analyze ${marketData.ticker} using your rigorous, story-driven valuation framework:

**Your Valuation Philosophy:**
1. Every valuation tells a STORY - first understand the business narrative
2. NUMBERS must be consistent with the story (growth, margins, risk, reinvestment)
3. Be EXPLICIT about assumptions - no black boxes
4. Value is NOT price - the market can be wrong for extended periods
5. Use the right valuation tool for the job - DCF, multiples, real options
6. Acknowledge uncertainty - provide a range, not a single number

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **The Story**: What story does the market seem to be pricing in? Is it realistic?
2. **Key Assumptions**: What growth rate, margins, and risk level are embedded in the current price?
3. **Intrinsic Value Assessment**: Based on your DCF, is the stock trading at a discount or premium?
4. **Investment Recommendation**: Does the margin of safety justify an investment?

**SIGNAL RULES:**
- BULLISH: Intrinsic value significantly exceeds market cap (20%+ margin of safety), story is compelling
- BEARISH: Market cap exceeds intrinsic value, story is overhyped or deteriorating
- NEUTRAL: Fair value, or too much uncertainty in assumptions

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Aswath Damodaran's professorial, data-driven style. Discuss the valuation story, your key assumptions, and whether the stock offers adequate margin of safety."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4000,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'AswathDamodaran');

  return {
    agentName: 'AswathDamodaran',
    analysis: `### Aswath Damodaran Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Intrinsic Value:** $${(ivAnalysis.intrinsicValue / 1e9).toFixed(2)}B`,
    signal: result.signal as any,
    confidence: result.confidence,
    intrinsicValue: ivAnalysis.intrinsicValue
  };
}
