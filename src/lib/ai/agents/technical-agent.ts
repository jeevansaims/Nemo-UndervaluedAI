/**
 * Technical Analysis Agent - Analyzes price momentum, moving averages, and volume patterns
 * Based on undervalued.ai's methodology
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, AgentResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface TechnicalResult extends AgentResult {
  agentName: 'Technical';
  trend: 'Bullish' | 'Neutral' | 'Bearish';
  momentum: 'Strong' | 'Moderate' | 'Weak';
  supportLevel?: number;
  resistanceLevel?: number;
}

const TECHNICAL_PROMPT = `You are an expert technical analyst specializing in equity markets.

Your task is to analyze price patterns and technical indicators to identify:
1. Price momentum and trend direction
2. Support and resistance levels
3. Moving average relationships (50-day vs 200-day)
4. Volume patterns and confirmation signals
5. Key reversal patterns if any

Based on your analysis, determine:
- Overall Trend: Bullish, Neutral, or Bearish
- Momentum Strength: Strong, Moderate, or Weak
- Key support and resistance price levels
- Entry/exit timing signals

Be specific with price levels and provide clear reasoning.`;

export async function runTechnicalAgent(
  marketData: MarketData
): Promise<TechnicalResult> {
  try {
    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}
Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
Beta: ${marketData.beta || 'N/A'}

Note: Analyze based on typical technical patterns for this stock and sector.
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${TECHNICAL_PROMPT}\n\nAnalyze the following stock:\n\n${dataContext}\n\nProvide your technical analysis.`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse trend and momentum
    const trendMatch = analysis.match(/(?:overall\s+)?trend[:\s]+(bullish|neutral|bearish)/i);
    const momentumMatch = analysis.match(/momentum[:\s]+(strong|moderate|weak)/i);
    const supportMatch = analysis.match(/support[:\s]+\$?([0-9,.]+)/i);
    const resistanceMatch = analysis.match(/resistance[:\s]+\$?([0-9,.]+)/i);

    const trend = trendMatch 
      ? (trendMatch[1].charAt(0).toUpperCase() + trendMatch[1].slice(1).toLowerCase()) as 'Bullish' | 'Neutral' | 'Bearish'
      : 'Neutral';
    const momentum = momentumMatch
      ? (momentumMatch[1].charAt(0).toUpperCase() + momentumMatch[1].slice(1).toLowerCase()) as 'Strong' | 'Moderate' | 'Weak'
      : 'Moderate';

    // Extract key points
    const keyPoints = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 4);

    return {
      agentName: 'Technical',
      analysis,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['See full analysis for technical levels'],
      trend,
      momentum,
      supportLevel: supportMatch ? parseFloat(supportMatch[1].replace(/,/g, '')) : undefined,
      resistanceLevel: resistanceMatch ? parseFloat(resistanceMatch[1].replace(/,/g, '')) : undefined,
      score: trend === 'Bullish' ? 70 : trend === 'Bearish' ? 30 : 50,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Technical agent error:', error);
    throw new Error(`Technical analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
