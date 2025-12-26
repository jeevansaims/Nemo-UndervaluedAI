/**
 * Ben Graham Agent - The Godfather of Value Investing
 * Focuses on margin of safety, net-net stocks, and deep value.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface BenGrahamResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  marginOfSafety: number;
  netNetValue?: number;
}

export async function runBenGrahamAgent(marketData: MarketData): Promise<BenGrahamResult> {
  // Graham's Key Metrics
  const pbRatio = marketData.pbRatio || 0;
  const peRatio = marketData.peRatio || 0;
  const debtToEquity = marketData.debtToEquity || 0;
  const currentPrice = marketData.currentPrice;
  
  // Graham Number (simplified): sqrt(22.5 * EPS * Book Value)
  // We'll use P/E and P/B as proxies
  const grahamPE = peRatio < 15 ? 'Attractive' : peRatio < 25 ? 'Fair' : 'Expensive';
  const grahamPB = pbRatio < 1.5 ? 'Deep Value' : pbRatio < 3 ? 'Fair' : 'Premium';
  
  // Margin of Safety (simplified based on P/B)
  const marginOfSafety = pbRatio > 0 ? (1 - (pbRatio / 1.5)) : 0;
  
  // Financial Strength Check (Graham's criteria)
  const debtOK = debtToEquity < 0.5;
  const valuationOK = peRatio < 15 && pbRatio < 1.5;
  
  const quantSummary = `
BEN GRAHAM ANALYSIS:
- P/E Ratio: ${peRatio.toFixed(2)} (${grahamPE})
- P/B Ratio: ${pbRatio.toFixed(2)} (${grahamPB})
- Debt/Equity: ${debtToEquity.toFixed(2)} (${debtOK ? 'Conservative' : 'High Leverage'})
- Estimated Margin of Safety: ${(marginOfSafety * 100).toFixed(1)}%
`;

  const prompt = `You are Ben Graham, the father of value investing and author of "The Intelligent Investor" and "Security Analysis". 

Analyze ${marketData.ticker} using your rigorous value investing principles:

**Your Investment Philosophy:**
1. MARGIN OF SAFETY is paramount - never pay more than 2/3 of intrinsic value
2. Balance sheet strength - prefer companies with low debt and strong current ratios
3. Earnings stability - look for consistent earnings over 10+ years
4. Dividend record - prefer companies that pay dividends
5. P/E ratio should be below 15, P/B below 1.5 for defensive investors
6. "Mr. Market" is irrational - exploit his mood swings, don't follow them

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Valuation Assessment**: How does the P/E and P/B compare to your criteria? Is there a margin of safety?
2. **Balance Sheet Review**: Analyze the debt-to-equity ratio. Is the company conservatively financed?
3. **Quality of Earnings**: Based on available metrics, are earnings likely stable and reliable?
4. **Investment Conclusion**: Would you recommend this as a "defensive" or "enterprising" investment, or neither?

**SIGNAL RULES:**
- BULLISH: P/E < 15 AND P/B < 1.5 AND D/E < 0.5 = Classic Graham Net-Net or Defensive Value
- BEARISH: P/E > 25 OR P/B > 3 OR D/E > 1.0 = Speculative, No Margin of Safety
- NEUTRAL: Mixed signals or insufficient data

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs of detailed analysis in Ben Graham's voice, referencing specific metrics and your investment principles. Discuss margin of safety, balance sheet quality, and whether this meets your criteria for a sound investment."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 4000,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'BenGraham');

  return {
    agentName: 'BenGraham',
    analysis: `### Ben Graham Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Metrics:** P/E: ${peRatio.toFixed(2)}, P/B: ${pbRatio.toFixed(2)}, D/E: ${debtToEquity.toFixed(2)}`,
    signal: result.signal as any,
    confidence: result.confidence,
    marginOfSafety: marginOfSafety
  };
}
