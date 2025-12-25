/**
 * Charlie Munger Agent - Warren Buffett's Partner
 * Focuses on wonderful businesses at fair prices, mental models.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CharlieMungerResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runCharlieMungerAgent(marketData: MarketData): Promise<CharlieMungerResult> {
  const roe = marketData.roe || 0;
  const peRatio = marketData.peRatio || 0;
  const revenueGrowth = marketData.revenueGrowth || 0;
  
  // Munger quality check
  const isQualityBusiness = roe > 0.15 && revenueGrowth > 0;
  const isFairPrice = peRatio < 25;
  
  const quantSummary = `
CHARLIE MUNGER ANALYSIS:
- ROE: ${(roe * 100).toFixed(1)}% (${roe > 0.15 ? 'Excellent' : roe > 0.10 ? 'Good' : 'Poor'})
- P/E Ratio: ${peRatio.toFixed(2)} (${isFairPrice ? 'Fair Price' : 'Premium'})
- Revenue Growth: ${(revenueGrowth).toFixed(1)}%
- Quality Business: ${isQualityBusiness ? 'Yes' : 'No'}
`;

  const prompt = `You are Charlie Munger. Apply your mental models:

1. Invert, always invert - what could go wrong?
2. Only buy wonderful businesses
3. A fair price for a great company beats a great price for a fair company
4. Sit on your hands - be patient

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Munger-style pithy wisdom"
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
    console.error("Failed to parse Munger agent response", e);
  }

  return {
    agentName: 'CharlieMunger',
    analysis: `### Charlie Munger Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Metrics:** ROE: ${(roe*100).toFixed(1)}%, P/E: ${peRatio.toFixed(2)}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
