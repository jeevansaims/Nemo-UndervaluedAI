/**
 * Valuation Agent - Uses Claude (Anthropic) for deep value analysis
 * Inspired by Warren Buffett's value investing approach
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, ValuationResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VALUATION_PROMPT = `You are a world-class value investing analyst, inspired by Warren Buffett's philosophy.
Your task is to analyze stocks for their intrinsic value and determine if they're undervalued or overvalued.

Key principles to follow:
1. Focus on business fundamentals, not market sentiment
2. Calculate intrinsic value using DCF, P/E ratio analysis, and comparable company analysis
3. Identify economic moats and competitive advantages
4. Assess management quality and capital allocation
5. Consider margin of safety (buy at significant discount to intrinsic value)

Provide a comprehensive valuation analysis including:
- Intrinsic value estimate
- Target price (12-month)
- Upside/downside potential
- Quality of business (moat analysis)
- Key valuation metrics and their interpretation
- Whether the stock is undervalued, fairly valued, or overvalued

Be analytical, precise, and provide specific numbers with clear reasoning.`;

export async function runValuationAgent(
  marketData: MarketData
): Promise<ValuationResult> {
  const startTime = Date.now();

  try {
    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}
Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
P/E Ratio: ${marketData.peRatio || 'N/A'}
P/B Ratio: ${marketData.pbRatio || 'N/A'}
ROE: ${marketData.roe ? (marketData.roe * 100).toFixed(2) + '%' : 'N/A'}
Debt/Equity: ${marketData.debtToEquity || 'N/A'}
Revenue Growth: ${marketData.revenueGrowth ? (marketData.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
Earnings Growth: ${marketData.earningsGrowth ? (marketData.earningsGrowth * 100).toFixed(2) + '%' : 'N/A'}
Free Cash Flow: $${marketData.freeCashFlow ? (marketData.freeCashFlow / 1e6).toFixed(2) + 'M' : 'N/A'}
Dividend Yield: ${marketData.dividendYield ? (marketData.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `${VALUATION_PROMPT}\n\nAnalyze the following stock:\n\n${dataContext}\n\nProvide your detailed valuation analysis.`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse key metrics from the analysis (simple extraction)
    const intrinsicValueMatch = analysis.match(/intrinsic value[:\s]+\$?([\d,.]+)/i);
    const targetPriceMatch = analysis.match(/target price[:\s]+\$?([\d,.]+)/i);

    const intrinsicValue = intrinsicValueMatch
      ? parseFloat(intrinsicValueMatch[1].replace(/,/g, ''))
      : undefined;
    const targetPrice = targetPriceMatch
      ? parseFloat(targetPriceMatch[1].replace(/,/g, ''))
      : undefined;

    const upside = targetPrice
      ? ((targetPrice - marketData.currentPrice) / marketData.currentPrice) * 100
      : undefined;

    // Extract key points (look for bullet points or numbered lists)
    const keyPoints = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5);

    return {
      agentName: 'Valuation',
      analysis,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['See full analysis for details'],
      intrinsicValue,
      targetPrice,
      upside,
      score: upside !== undefined ? Math.min(100, Math.max(0, upside + 50)) : undefined,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Valuation agent error:', error);
    throw new Error(`Valuation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
