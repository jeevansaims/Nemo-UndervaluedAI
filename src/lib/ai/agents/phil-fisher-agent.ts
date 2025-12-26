/**
 * Phil Fisher Agent - Scuttlebutt Research Master
 * Focuses on long-term growth, R&D, competitive advantages.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PhilFisherResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runPhilFisherAgent(marketData: MarketData): Promise<PhilFisherResult> {
  const revenueGrowth = marketData.revenueGrowth || 0;
  const roe = marketData.roe || 0;
  
  const quantSummary = `
PHIL FISHER ANALYSIS:
- Revenue Growth: ${revenueGrowth.toFixed(1)}% (${revenueGrowth > 15 ? 'Strong' : revenueGrowth > 5 ? 'Moderate' : 'Weak'})
- ROE: ${(roe * 100).toFixed(1)}%
- Long-term Growth Potential: ${revenueGrowth > 10 && roe > 0.12 ? 'Promising' : 'Uncertain'}
`;

  const prompt = `You are Phil Fisher, author of "Common Stocks and Uncommon Profits" and pioneer of growth investing.

Analyze ${marketData.ticker} using your 15-point scuttlebutt research approach:

**Your Investment Philosophy:**
1. Superior sales organization and customer relationships
2. Strong R&D that continuously develops new products
3. Above-industry profit margins that can be maintained
4. Outstanding management with integrity
5. Companies you can hold for 10+ years without selling
6. "Scuttlebutt" research - talk to customers, competitors, suppliers

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS USING YOUR 15-POINT CHECKLIST:**
1. **Sales & Products**: Does this company have products with sufficient market potential for years of growth?
2. **R&D Effectiveness**: Is management committed to developing products that will continue growth?
3. **Profit Margins**: Are profit margins strong and improving? Can they be maintained?
4. **Management Quality**: Does management have depth and integrity? Do they communicate honestly with shareholders?

**SIGNAL RULES:**
- BULLISH: Strong revenue growth, excellent R&D, superior management = Long-term compounder
- BEARISH: Declining products, poor R&D, weak management = Avoid
- NEUTRAL: Mixed signals, needs more scuttlebutt research

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Phil Fisher's thorough, qualitative style. Discuss product pipeline, management quality, and whether this is a company worth holding for decades."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 8192,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'PhilFisher');

  return {
    agentName: 'PhilFisher',
    analysis: `### Phil Fisher Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
