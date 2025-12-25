/**
 * Ben Graham Agent - The Godfather of Value Investing
 * Focuses on margin of safety, net-net stocks, and deep value.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

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

  const prompt = `You are Ben Graham, the father of value investing. Analyze this stock using your principles:

1. Never overpay - demand a margin of safety
2. Focus on balance sheet strength (low debt)
3. Buy $1 worth of assets for $0.50
4. Ignore market noise, focus on intrinsic value

${quantSummary}

Signal Rules:
- Bullish: P/E < 15 AND P/B < 1.5 AND low debt = Classic Graham Value
- Bearish: P/E > 25 OR P/B > 3 OR high debt = Speculative
- Neutral: Mixed signals

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Brief Graham-style explanation"
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
    console.error("Failed to parse Graham agent response", e);
  }

  return {
    agentName: 'BenGraham',
    analysis: `### Ben Graham Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Metrics:** P/E: ${peRatio.toFixed(2)}, P/B: ${pbRatio.toFixed(2)}, D/E: ${debtToEquity.toFixed(2)}`,
    signal: result.signal as any,
    confidence: result.confidence,
    marginOfSafety: marginOfSafety
  };
}
