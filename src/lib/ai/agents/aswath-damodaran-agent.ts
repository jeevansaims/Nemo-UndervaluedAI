/**
 * Aswath Damodaran Agent - The Dean of Valuation
 * Story + Numbers + Disciplined DCF.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { calculateIntrinsicValue } from '../financial-analysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AswathDamodaranResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  intrinsicValue: number;
}

export async function runAswathDamodaranAgent(marketData: MarketData): Promise<AswathDamodaranResult> {
  const history = marketData.financialHistory || [];
  const ivAnalysis = calculateIntrinsicValue(history, marketData.currentPrice);
  
  const marginOfSafety = marketData.marketCap && ivAnalysis.intrinsicValue > 0 
    ? (ivAnalysis.intrinsicValue - marketData.marketCap) / marketData.marketCap 
    : 0;
  
  const quantSummary = `
ASWATH DAMODARAN ANALYSIS:
- Intrinsic Value (DCF): $${(ivAnalysis.intrinsicValue / 1e9).toFixed(2)}B
- Market Cap: $${(marketData.marketCap ? marketData.marketCap / 1e9 : 0).toFixed(2)}B
- Margin of Safety: ${(marginOfSafety * 100).toFixed(1)}%
- Valuation Details: ${ivAnalysis.details.slice(0, 2).join(', ')}
`;

  const prompt = `You are Aswath Damodaran. Apply disciplined valuation:

1. Every valuation tells a story - what's the story here?
2. Numbers must be consistent with the story
3. Be explicit about assumptions (growth, risk, reinvestment)
4. Value is not price - focus on intrinsic value

${quantSummary}

Return JSON:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number,
  "reasoning": "Damodaran-style valuation narrative"
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
    console.error("Failed to parse Damodaran agent response", e);
  }

  return {
    agentName: 'AswathDamodaran',
    analysis: `### Aswath Damodaran Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**Intrinsic Value:** $${(ivAnalysis.intrinsicValue / 1e9).toFixed(2)}B`,
    signal: result.signal as any,
    confidence: result.confidence,
    intrinsicValue: ivAnalysis.intrinsicValue
  };
}
