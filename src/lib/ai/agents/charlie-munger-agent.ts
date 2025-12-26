/**
 * Charlie Munger Agent - Warren Buffett's Partner
 * Focuses on wonderful businesses at fair prices, mental models.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

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

  const prompt = `You are Charlie Munger, Warren Buffett's partner and Vice Chairman of Berkshire Hathaway.

Analyze ${marketData.ticker} using your mental models and worldly wisdom:

**Your Investment Philosophy:**
1. INVERT, ALWAYS INVERT - Think about what could destroy this business
2. Only buy "wonderful businesses" - companies with durable competitive advantages
3. A fair price for a great company beats a great price for a fair company
4. Circle of competence - only invest in what you truly understand
5. Avoid mental biases - overconfidence, incentive-caused bias, social proof
6. Patience is a virtue - sit on your hands and wait for the fat pitch

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Business Quality Assessment**: Is this a "wonderful business"? Does it have pricing power, high returns on capital, and a durable moat?
2. **Mental Model Application**: Apply relevant mental models (lollapalooza effects, margin of safety, man with a hammer syndrome). What could go wrong?
3. **Valuation Reasonableness**: At current prices, are you paying a fair price for quality?
4. **Investment Thesis**: Would you recommend adding this to a concentrated portfolio of great businesses?

**SIGNAL RULES:**
- BULLISH: High ROE (>15%), reasonable P/E, clear moat = Wonderful business at fair price
- BEARISH: Poor capital allocation, commodity business, or grossly overvalued
- NEUTRAL: Good business but price too high, or average business at fair price

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Charlie Munger's direct, pithy style. Apply relevant mental models, discuss what could go wrong (inversion), and give your candid assessment of business quality vs. price."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 8192,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'CharlieMunger');

  return {
    agentName: 'CharlieMunger',
    analysis: `### Charlie Munger Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Metrics:** ROE: ${(roe*100).toFixed(1)}%, P/E: ${peRatio.toFixed(2)}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
