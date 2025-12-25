/**
 * Risk Agent - Uses Claude (Anthropic) for comprehensive risk analysis
 * Identifies and quantifies potential risks and downside scenarios
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, RiskResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RISK_PROMPT = `You are a risk management expert specializing in investment risk assessment.

Your task is to identify and analyze all potential risks associated with investing in a stock:
1. Business Risks: Competition, disruption, market share loss
2. Financial Risks: Debt levels, liquidity issues, bankruptcy risk
3. Market Risks: Volatility, beta, correlation with market
4. Regulatory Risks: Legal challenges, regulatory changes
5. Operational Risks: Management turnover, execution risk
6. Macro Risks: Economic cycle sensitivity, interest rate sensitivity
7. Valuation Risks: Overvaluation, multiple compression
8. Event Risks: Black swan events, company-specific catalysts

Provide a comprehensive risk analysis including:
- Risk Level (Low/Medium/High)
- Top 5 risk factors ranked by importance
- Probability assessment of key risks
- Potential downside scenarios
- Risk mitigation factors (what could reduce these risks?)
- Overall risk-reward profile

Be thorough in identifying potential problems - think like a short seller.`;

export async function runRiskAgent(marketData: MarketData): Promise<RiskResult> {
  const startTime = Date.now();

  try {
    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}
Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
Debt/Equity: ${marketData.debtToEquity || 'N/A'}
Beta: ${marketData.beta || 'N/A'}
P/E Ratio: ${marketData.peRatio || 'N/A'}

Context:
${marketData.recentNews?.length ? `Recent news indicates ${marketData.recentNews.length} notable events` : 'Limited recent news'}
${marketData.insiderTransactions?.length ? `${marketData.insiderTransactions.length} insider transactions recorded` : 'No insider transactions'}
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${RISK_PROMPT}\n\nConduct a comprehensive risk analysis for:\n\n${dataContext}`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse risk level from the analysis
    const riskLevelMatch = analysis.match(/risk level[:\s]+(Low|Medium|High)/i);
    const riskLevel = riskLevelMatch
      ? (riskLevelMatch[1] as 'Low' | 'Medium' | 'High')
      : 'Medium';

    // Extract risk factors (look for numbered or bulleted lists)
    const riskFactors = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5);

    // Calculate score (inverse of risk - lower risk = higher score)
    const score = riskLevel === 'Low' ? 80 : riskLevel === 'Medium' ? 50 : 20;

    // POSITION SIZING CALCULATION
    // Based on Kelly Criterion / Fixed Fractional approach
    // Portfolio Size: $100,000 (configurable)
    // Risk per Trade: 2% of portfolio = $2,000
    // Position Size = Risk Amount / (Current Price * Volatility Factor)
    const portfolioSize = 100000; // $100k default portfolio
    const riskPerTrade = 0.02; // 2% risk per trade
    const riskAmount = portfolioSize * riskPerTrade; // $2,000
    
    // Volatility factor based on beta (higher beta = smaller position)
    const beta = marketData.beta || 1;
    const volatilityFactor = Math.max(0.5, Math.min(2, beta)); // Clamp between 0.5 and 2
    
    // Risk-adjusted position sizing
    // Lower risk level = larger position, higher risk = smaller position
    const riskMultiplier = riskLevel === 'Low' ? 1.5 : riskLevel === 'Medium' ? 1.0 : 0.5;
    
    // Calculate max position value and shares
    const maxPositionValue = (riskAmount / volatilityFactor) * riskMultiplier * 10; // Scale up for reasonable position
    const positionSize = Math.floor(maxPositionValue / marketData.currentPrice);
    const positionValue = positionSize * marketData.currentPrice;
    const portfolioWeight = (positionValue / portfolioSize) * 100;

    return {
      agentName: 'Risk',
      analysis,
      keyPoints: riskFactors.length > 0 ? riskFactors : ['See full analysis for risk assessment'],
      riskLevel,
      riskFactors,
      score,
      timestamp: new Date(),
      // New position sizing fields
      positionSize,
      positionValue,
      portfolioWeight,
    };
  } catch (error) {
    console.error('Risk agent error:', error);
    throw new Error(`Risk analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
