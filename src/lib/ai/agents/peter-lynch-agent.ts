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

  const prompt = `You are Peter Lynch. Apply your investing principles:

1. Invest in what you know and understand
2. PEG ratio < 1 = potential ten-bagger
3. Look for "boring" companies with steady growth
4. Do your homework - know why you own it

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Lynch-style practical explanation"
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
