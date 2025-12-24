/**
 * AI Orchestrator - Coordinates all agents and manages the analysis workflow
 * Updated to support 8-dimensional analysis matching undervalued.ai methodology
 */

import { runValuationAgent } from './agents/valuation-agent';
import { runSentimentAgent } from './agents/sentiment-agent';
import { runFundamentalAgent } from './agents/fundamental-agent';
import { runRiskAgent } from './agents/risk-agent';
import { runTechnicalAgent } from './agents/technical-agent';
import { runPeerComparisonAgent } from './agents/peer-comparison-agent';
import { runMacroAgent } from './agents/macro-agent';
import { runEarningsCallAgent } from './agents/earnings-call-agent';
import { runPortfolioManager } from './agents/portfolio-manager';
import { MarketData, AnalysisResult } from './types';

/**
 * Run comprehensive multi-agent stock analysis
 * Executes all 8 specialist agents in parallel, then synthesizes with portfolio manager
 */
export async function runStockAnalysis(marketData: MarketData): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    console.log(`Starting 8-dimensional analysis for ${marketData.ticker}...`);

    // Run all specialist agents in parallel for speed (8 agents now)
    const [
      valuationResult,
      sentimentResult,
      fundamentalResult,
      riskResult,
      technicalResult,
      peerComparisonResult,
      macroResult,
      earningsCallResult,
    ] = await Promise.all([
      runValuationAgent(marketData),
      runSentimentAgent(marketData),
      runFundamentalAgent(marketData),
      runRiskAgent(marketData),
      runTechnicalAgent(marketData),
      runPeerComparisonAgent(marketData),
      runMacroAgent(marketData),
      runEarningsCallAgent(marketData),
    ]);

    console.log(`All 8 specialist agents completed for ${marketData.ticker}`);

    // Run portfolio manager to synthesize all analyses
    const portfolioManagerResult = await runPortfolioManager(
      marketData,
      valuationResult,
      sentimentResult,
      fundamentalResult,
      riskResult,
      technicalResult,
      peerComparisonResult,
      macroResult,
      earningsCallResult
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
      technical: technicalResult,
      peerComparison: peerComparisonResult,
      macro: macroResult,
      earningsCall: earningsCallResult,
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
