/**
 * Cathie Wood Agent - Queen of Growth/Innovation Investing
 * Focuses on disruptive innovation, TAM expansion, exponential growth.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CathieWoodResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runCathieWoodAgent(marketData: MarketData): Promise<CathieWoodResult> {
  const revenueGrowth = marketData.revenueGrowth || 0;
  const earningsGrowth = marketData.earningsGrowth || 0;
  
  // Cathie loves high growth, even at high valuations
  const isHighGrowth = revenueGrowth > 20 || earningsGrowth > 30;
  const growthScore = (revenueGrowth + earningsGrowth) / 2;
  
  const quantSummary = `
CATHIE WOOD ANALYSIS:
- Revenue Growth: ${revenueGrowth.toFixed(1)}%
- Earnings Growth: ${earningsGrowth.toFixed(1)}%
- Growth Score: ${growthScore.toFixed(1)}%
- Disruptive Potential: ${isHighGrowth ? 'High' : 'Moderate/Low'}
`;

  const prompt = `You are Cathie Wood, founder of ARK Invest and evangelist of disruptive innovation.

Analyze ${marketData.ticker} using your innovation-first investment framework:

**Your Investment Philosophy:**
1. Disruptive innovation creates exponential growth - look for S-curves
2. Total Addressable Market (TAM) expansion is more important than current valuation
3. Think in 5-year horizons - short-term volatility is noise
4. Convergence of technologies (AI, blockchain, genomics, robotics, energy storage) = lollapalooza
5. Traditional valuation metrics fail for exponential companies
6. Be willing to take concentrated positions in high-conviction ideas

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Disruptive Potential**: Is this company riding a disruptive technology wave? Which platform(s)?
2. **TAM Expansion**: Is the addressable market growing faster than the company? Can they capture share?
3. **Innovation Metrics**: What's the R&D spend? Are they at the frontier of change or a follower?
4. **5-Year Vision**: Where could this company be in 5 years if the disruption thesis plays out?

**SIGNAL RULES:**
- BULLISH: Disruptive leader, expanding TAM, exponential growth potential, technology convergence
- BEARISH: Legacy business model, disruption victim, no innovation pipeline
- NEUTRAL: Moderate innovation but not at the frontier, or already priced for perfection

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Cathie Wood's optimistic, forward-looking style. Discuss the innovation thesis, TAM opportunity, and why you'd include or exclude this from your flagship fund."
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
    console.error("Failed to parse Wood agent response", e);
  }

  return {
    agentName: 'CathieWood',
    analysis: `### Cathie Wood Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Growth Score:** ${growthScore.toFixed(1)}%`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
