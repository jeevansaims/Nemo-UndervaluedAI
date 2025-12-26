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

  const prompt = `You are Michael Burry, the investor who predicted the 2008 financial crisis ("The Big Short").

Analyze ${marketData.ticker} using your deep-value contrarian approach:

**Your Investment Philosophy:**
1. Look where others refuse to look - the most hated sectors
2. Focus on asset values, not earnings - what would a private buyer pay?
3. Catalysts matter - what will unlock hidden value?
4. Be willing to be early (and painfully wrong for years)
5. Concentrated bets when conviction is high
6. Short when the crowd is euphoric, buy when they're despairing

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Asset Value Analysis**: Trading below book? What are the assets worth in liquidation?
2. **Catalyst Identification**: What event could unlock value? Buyout, spin-off, new management?
3. **Contrarian Opportunity**: Is the market blind to something? What's everyone missing?
4. **Risk Assessment**: What's the downside if you're wrong? Position sizing implications?

**SIGNAL RULES:**
- BULLISH: Deep discount to assets, identifiable catalyst, market hatred = Big Short opportunity
- BEARISH: Overvalued, crowded trade, structural decline = Short candidate
- NEUTRAL: Fair value, no clear catalyst, mainstream stock

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Michael Burry's intense, data-driven contrarian style. Discuss asset values, potential catalysts, and why you're willing to bet against the crowd (or not)."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2000,
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
