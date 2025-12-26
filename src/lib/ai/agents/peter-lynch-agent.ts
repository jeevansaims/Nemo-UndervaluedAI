/**
 * Peter Lynch Agent - Find Ten-Baggers in Everyday Businesses
 * Focuses on PEG ratio, understandable businesses, growth at reasonable price.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PeterLynchResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  pegRatio: number;
}

export async function runPeterLynchAgent(marketData: MarketData): Promise<PeterLynchResult> {
  const peRatio = marketData.peRatio || 0;
  const earningsGrowth = marketData.earningsGrowth || 0;
  
  // PEG Ratio (P/E divided by earnings growth rate)
  const pegRatio = earningsGrowth > 0 ? peRatio / earningsGrowth : 999;
  
  const pegAssessment = pegRatio < 1 ? 'Undervalued (Ten-bagger potential!)' : 
                        pegRatio < 1.5 ? 'Fairly Valued' : 
                        pegRatio < 2 ? 'Somewhat Expensive' : 'Overvalued';

  const quantSummary = `
PETER LYNCH ANALYSIS:
- P/E Ratio: ${peRatio.toFixed(2)}
- Earnings Growth: ${earningsGrowth.toFixed(1)}%
- PEG Ratio: ${pegRatio.toFixed(2)} (${pegAssessment})
`;

  const prompt = `You are Peter Lynch, legendary fund manager of Fidelity Magellan Fund.

Analyze ${marketData.ticker} using your "invest in what you know" philosophy:

**Your Investment Philosophy:**
1. Invest in what you understand - can you explain this business in 2 minutes?
2. PEG ratio is king - PEG < 1 = potential ten-bagger
3. Look for "boring" companies in unglamorous industries
4. The best stocks are in companies everyone ignores
5. Do your homework - know WHY you own every stock
6. Fast growers (20-50% growth) are ideal, but stalwarts (10-20%) are safer

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Stock Category**: Is this a Slow Grower, Stalwart, Fast Grower, Cyclical, Turnaround, or Asset Play?
2. **PEG Ratio Analysis**: At ${pegRatio.toFixed(2)}, is this a bargain or overpriced relative to growth?
3. **The Story**: What's the simple story here? Can a 10-year-old understand why this company will grow?
4. **Ten-Bagger Potential**: Does this have multi-year growth runway, or is it already priced for perfection?

**SIGNAL RULES:**
- BULLISH: PEG < 1.0, strong growth story, under-followed = Ten-bagger potential
- BEARISH: PEG > 2.0, declining growth, no clear story = Avoid
- NEUTRAL: Average PEG, mainstream stock, limited upside = Hold or wait

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Peter Lynch's accessible, plain-English style. Discuss what category of stock this is, whether the PEG makes it attractive, and whether you'd recommend it to your family."
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
    console.error("Failed to parse Lynch agent response", e);
  }

  return {
    agentName: 'PeterLynch',
    analysis: `### Peter Lynch Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**PEG Ratio:** ${pegRatio.toFixed(2)} (${pegAssessment})`,
    signal: result.signal as any,
    confidence: result.confidence,
    pegRatio: pegRatio
  };
}
