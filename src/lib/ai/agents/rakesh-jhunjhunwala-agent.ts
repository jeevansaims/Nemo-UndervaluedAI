/**
 * Rakesh Jhunjhunwala Agent - The Big Bull of India
 * Growth + value blend, long-term conviction.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface RakeshJhunjhunwalaResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export async function runRakeshJhunjhunwalaAgent(marketData: MarketData): Promise<RakeshJhunjhunwalaResult> {
  const revenueGrowth = marketData.revenueGrowth || 0;
  const earningsGrowth = marketData.earningsGrowth || 0;
  const roe = marketData.roe || 0;
  const peRatio = marketData.peRatio || 0;
  
  // Jhunjhunwala: Growth at Reasonable Price (like Lynch + Graham blend)
  const isGrowth = revenueGrowth > 15 || earningsGrowth > 15;
  const isReasonable = peRatio < 30;
  const isQuality = roe > 0.12;
  
  const quantSummary = `
RAKESH JHUNJHUNWALA ANALYSIS:
- Revenue Growth: ${revenueGrowth.toFixed(1)}%
- Earnings Growth: ${earningsGrowth.toFixed(1)}%
- ROE: ${(roe * 100).toFixed(1)}%
- P/E Ratio: ${peRatio.toFixed(2)}
- Big Bull Setup: ${isGrowth && isReasonable && isQuality ? 'YES' : 'No'}
`;

  const prompt = `You are Rakesh Jhunjhunwala, India's legendary investor known as "The Big Bull" and founder of Rare Enterprises.

Analyze ${marketData.ticker} with your optimistic, growth-oriented investment philosophy:

**Your Investment Philosophy:**
1. BE BULLISH on growth stories with long runways - believe in the future
2. Buy businesses with STRONG EARNINGS MOMENTUM and visible catalysts
3. HOLD FOR THE LONG TERM - let compounding work its magic
4. Quality MANAGEMENT is essential - back capable entrepreneurs
5. Don't be afraid of volatility - it creates opportunity
6. Take CONCENTRATED POSITIONS in your highest conviction ideas

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Growth Story**: Is this a multi-year growth story? What's driving the growth?
2. **Earnings Quality**: Is the earnings growth sustainable and high-quality?
3. **Management Assessment**: Based on available information, does management appear capable?
4. **Long-term Conviction**: Would you hold this for 5-10 years through volatility?

**SIGNAL RULES:**
- BULLISH: Strong growth trajectory, quality business, competent management = Big Bull conviction
- BEARISH: Declining growth, poor returns, or structural challenges = Avoid
- NEUTRAL: Unclear growth story or too expensive for the growth being delivered

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "reasoning": "Provide 2-4 paragraphs in Rakesh Jhunjhunwala's optimistic, conviction-driven style. Discuss the growth story, why you believe in the future (or don't), and whether this deserves a significant position."
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 4000,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'RakeshJhunjhunwala');

  return {
    agentName: 'RakeshJhunjhunwala',
    analysis: `### Rakesh Jhunjhunwala Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}`,
    signal: result.signal as any,
    confidence: result.confidence
  };
}
