/**
 * Fundamental Agent - Uses Claude (Anthropic) for fundamental analysis
 * Deep dive into financial health, business model, and competitive position
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, FundamentalResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FUNDAMENTAL_PROMPT = `You are a seasoned fundamental analyst with expertise in financial statement analysis and business evaluation.

Your task is to conduct a thorough fundamental analysis of a company, focusing on:
1. Financial Health: Balance sheet strength, liquidity, solvency
2. Profitability: Margins, ROE, ROA, ROIC
3. Growth Trajectory: Revenue and earnings growth trends
4. Business Model: How the company makes money, unit economics
5. Competitive Position: Market share, barriers to entry, switching costs
6. Industry Dynamics: Sector trends, tailwinds/headwinds
7. Management Quality: Capital allocation, track record

Provide a comprehensive fundamental analysis including:
- Financial Health rating (Strong/Moderate/Weak)
- Growth Potential (High/Medium/Low)
- Key fundamental strengths
- Key fundamental concerns
- Business quality assessment
- Sustainability of competitive advantages

Be thorough and analytical in your assessment.`;

export async function runFundamentalAgent(
  marketData: MarketData
): Promise<FundamentalResult> {
  const startTime = Date.now();

  try {
    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}

Financial Metrics:
- Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
- P/E Ratio: ${marketData.peRatio || 'N/A'}
- P/B Ratio: ${marketData.pbRatio || 'N/A'}
- ROE: ${marketData.roe ? (marketData.roe * 100).toFixed(2) + '%' : 'N/A'}
- Debt/Equity: ${marketData.debtToEquity || 'N/A'}
- Revenue Growth (YoY): ${marketData.revenueGrowth ? (marketData.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
- Earnings Growth (YoY): ${marketData.earningsGrowth ? (marketData.earningsGrowth * 100).toFixed(2) + '%' : 'N/A'}
- Free Cash Flow: $${marketData.freeCashFlow ? (marketData.freeCashFlow / 1e6).toFixed(2) + 'M' : 'N/A'}
- Dividend Yield: ${marketData.dividendYield ? (marketData.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
- Beta: ${marketData.beta || 'N/A'}
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${FUNDAMENTAL_PROMPT}\n\nConduct a fundamental analysis for:\n\n${dataContext}`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse ratings from the analysis
    const healthMatch = analysis.match(/financial health[:\s]+(Strong|Moderate|Weak)/i);
    const growthMatch = analysis.match(/growth potential[:\s]+(High|Medium|Low)/i);

    const financialHealth = healthMatch
      ? (healthMatch[1] as 'Strong' | 'Moderate' | 'Weak')
      : 'Moderate';
    const growthPotential = growthMatch
      ? (growthMatch[1] as 'High' | 'Medium' | 'Low')
      : 'Medium';

    // Calculate score based on ratings
    const healthScore = financialHealth === 'Strong' ? 80 : financialHealth === 'Moderate' ? 50 : 20;
    const growthScore = growthPotential === 'High' ? 80 : growthPotential === 'Medium' ? 50 : 20;
    const score = (healthScore + growthScore) / 2;

    // Extract key points
    const keyPoints = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5);

    return {
      agentName: 'Fundamental',
      analysis,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['See full analysis for fundamental insights'],
      financialHealth,
      growthPotential,
      score,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Fundamental agent error:', error);
    throw new Error(`Fundamental analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
