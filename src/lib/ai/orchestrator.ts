/**
 * AI Orchestrator - Coordinates all agents and manages the analysis workflow
 */

import { runValuationAgent } from './agents/valuation-agent';
import { runSentimentAgent } from './agents/sentiment-agent';
import { runFundamentalAgent } from './agents/fundamental-agent';
import { runRiskAgent } from './agents/risk-agent';
import { runPortfolioManager } from './agents/portfolio-manager';
import { MarketData, AnalysisResult } from './types';

/**
 * Run comprehensive multi-agent stock analysis
 * Executes all specialist agents in parallel, then synthesizes with portfolio manager
 */
export async function runStockAnalysis(marketData: MarketData): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    console.log(`Starting analysis for ${marketData.ticker}...`);

    // Run all specialist agents in parallel for speed
    const [valuationResult, sentimentResult, fundamentalResult, riskResult] = await Promise.all([
      runValuationAgent(marketData),
      runSentimentAgent(marketData),
      runFundamentalAgent(marketData),
      runRiskAgent(marketData),
    ]);

    console.log(`All specialist agents completed for ${marketData.ticker}`);

    // Run portfolio manager to synthesize all analyses
    const portfolioManagerResult = await runPortfolioManager(
      marketData,
      valuationResult,
      sentimentResult,
      fundamentalResult,
      riskResult
    );

    console.log(`Portfolio manager synthesis completed for ${marketData.ticker}`);

    const processingTime = Date.now() - startTime;

    return {
      ticker: marketData.ticker,
      marketData,
      valuation: valuationResult,
      sentiment: sentimentResult,
      fundamental: fundamentalResult,
      risk: riskResult,
      portfolioManager: portfolioManagerResult,
      processingTime,
    };
  } catch (error) {
    console.error(`Stock analysis failed for ${marketData.ticker}:`, error);
    throw error;
  }
}

/**
 * Validate that required API keys are configured
 */
export function validateApiKeys() {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY is not configured. All agents now use Claude (Anthropic).');
  }
}
