/**
 * Multi-Agent Stock Analysis System
 *
 * Orchestrates multiple AI agents to analyze stocks:
 * 1. Valuation Agent - Determines if stock is undervalued
 * 2. Risk Agent - Assesses risk profile
 * 3. Technical Agent - Analyzes momentum and trends
 * 4. Portfolio Manager - Makes final BUY/SELL/HOLD decision
 */

import type { MarketData, PortfolioDecision } from './types';
import { analyzeValuation } from './valuationAgent';
import { assessRisk } from './riskAgent';
import { analyzeTechnicals } from './technicalAgent';
import { makePortfolioDecision } from './portfolioManager';

export interface StockAnalysisInput {
  ticker: string;
  currentPrice: number;
  marketCap?: number;

  // Valuation metrics
  pe?: number;
  pb?: number;
  ps?: number;
  eps?: number;

  // Quality metrics
  roe?: number;
  netMargin?: number;
  operatingMargin?: number;

  // Momentum
  priceChange52W?: number;
  high52W?: number;
  low52W?: number;

  // Risk metrics
  volatility?: number;
  beta?: number;
  maxDrawdown?: number;
}

export interface StockAnalysisResult extends PortfolioDecision {
  ticker: string;
  currentPrice: number;
  timestamp: Date;
}

/**
 * Main entry point: Run complete stock analysis
 */
export async function analyzeStock(input: StockAnalysisInput): Promise<StockAnalysisResult> {
  const startTime = Date.now();

  console.log(`[AI Agents] Starting analysis for ${input.ticker}`);

  // Prepare market data
  const marketData: MarketData = {
    ticker: input.ticker,
    currentPrice: input.currentPrice,
    marketCap: input.marketCap,
    pe: input.pe,
    pb: input.pb,
    ps: input.ps,
    eps: input.eps,
    roe: input.roe,
    netMargin: input.netMargin,
    operatingMargin: input.operatingMargin,
    priceChange52W: input.priceChange52W,
    high52W: input.high52W,
    low52W: input.low52W,
    volatility: input.volatility,
    beta: input.beta,
    maxDrawdown: input.maxDrawdown,
  };

  // Run all agents in parallel for speed
  const [valuationResult, riskResult, technicalResult] = await Promise.all([
    analyzeValuation(marketData),
    assessRisk(marketData),
    analyzeTechnicals(marketData),
  ]);

  console.log(`[AI Agents] ${input.ticker} - Valuation: ${valuationResult.score.toFixed(0)}, Risk: ${riskResult.score.toFixed(0)}, Technical: ${technicalResult.score.toFixed(0)}`);

  // Portfolio Manager makes final decision
  const decision = await makePortfolioDecision(
    marketData,
    valuationResult,
    riskResult,
    technicalResult
  );

  const elapsed = Date.now() - startTime;
  console.log(`[AI Agents] ${input.ticker} - ${decision.recommendation} @ ${decision.confidence}% confidence (${elapsed}ms)`);

  return {
    ...decision,
    ticker: input.ticker,
    currentPrice: input.currentPrice,
    timestamp: new Date(),
  };
}

// Re-export types for convenience
export type { PortfolioDecision, MarketData };
