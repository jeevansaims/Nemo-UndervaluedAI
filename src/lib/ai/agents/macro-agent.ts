/**
 * Macro-Environmental Agent - Analyzes broader economic context
 * Based on undervalued.ai's methodology
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, AgentResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MacroResult extends AgentResult {
  agentName: 'Macro';
  economicOutlook: 'Favorable' | 'Neutral' | 'Unfavorable';
  sectorTrend: 'Tailwind' | 'Neutral' | 'Headwind';
  interestRateSensitivity: 'High' | 'Medium' | 'Low';
}

const MACRO_PROMPT = `You are a macroeconomic analyst specializing in how economic conditions affect equity valuations.

Your task is to analyze how the broader economic environment impacts this stock:

1. Interest Rate Sensitivity
   - How do interest rates affect this company's cost of capital?
   - Impact on consumer/business demand for products
   - Debt servicing considerations

2. Inflation Impact
   - Pricing power in inflationary environment
   - Input cost sensitivity
   - Real earnings impact

3. Sector Rotation Analysis
   - Current cycle position (early/mid/late cycle)
   - Institutional money flow trends
   - Sector relative performance

4. Global Market Trends
   - International exposure and FX sensitivity
   - Supply chain considerations
   - Geopolitical risk factors

Provide a clear assessment of:
- Economic Outlook for this stock: Favorable, Neutral, or Unfavorable
- Sector Trend: Tailwind, Neutral, or Headwind
- Interest Rate Sensitivity: High, Medium, or Low`;

export async function runMacroAgent(
  marketData: MarketData
): Promise<MacroResult> {
  try {
    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}
Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
Beta: ${marketData.beta || 'N/A'}
Debt/Equity: ${marketData.debtToEquity || 'N/A'}
Dividend Yield: ${marketData.dividendYield ? (marketData.dividendYield * 100).toFixed(2) + '%' : 'N/A'}

Current Market Context (December 2024):
- Fed Funds Rate: ~4.25-4.50% (cutting cycle begun)
- Inflation: ~2.5% (moderating)
- GDP Growth: ~2.5% (resilient)
- Market: Near all-time highs
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${MACRO_PROMPT}\n\nAnalyze the following stock:\n\n${dataContext}\n\nProvide your macro-environmental analysis.`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse results
    const outlookMatch = analysis.match(/economic\s+outlook[:\s]+(favorable|neutral|unfavorable)/i);
    const sectorMatch = analysis.match(/sector\s+trend[:\s]+(tailwind|neutral|headwind)/i);
    const sensitivityMatch = analysis.match(/interest\s+rate\s+sensitivity[:\s]+(high|medium|low)/i);

    const economicOutlook = outlookMatch
      ? (outlookMatch[1].charAt(0).toUpperCase() + outlookMatch[1].slice(1).toLowerCase() as 'Favorable' | 'Neutral' | 'Unfavorable')
      : 'Neutral';
    
    const sectorTrend = sectorMatch
      ? (sectorMatch[1].charAt(0).toUpperCase() + sectorMatch[1].slice(1).toLowerCase() as 'Tailwind' | 'Neutral' | 'Headwind')
      : 'Neutral';

    const interestRateSensitivity = sensitivityMatch
      ? (sensitivityMatch[1].charAt(0).toUpperCase() + sensitivityMatch[1].slice(1).toLowerCase() as 'High' | 'Medium' | 'Low')
      : 'Medium';

    // Extract key points
    const keyPoints = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 4);

    return {
      agentName: 'Macro',
      analysis,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['See full analysis for macro factors'],
      economicOutlook,
      sectorTrend,
      interestRateSensitivity,
      score: economicOutlook === 'Favorable' ? 70 : economicOutlook === 'Unfavorable' ? 30 : 50,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Macro agent error:', error);
    throw new Error(`Macro analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
