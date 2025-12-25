/**
 * Financial Analysis Library
 * Ported from virattt/ai-hedge-fund (warren_buffett.py)
 * Provides quantitative analysis primitives for the Warren Buffett agent.
 */

import { FinancialPeriod } from './types';

export interface AnalysisScore {
  score: number;
  maxScore: number;
  details: string[];
}

export interface IntrinsicValueResult {
  intrinsicValue: number;
  description: string;
  assumptions: Record<string, number>;
  details: string[];
}

/**
 * 1. Analyze Economic Moat
 * Checks compatibility with Buffett's moat criteria:
 * - High & Consistent ROE (>15%)
 * - Stable/Expanding Margins (Pricing Power)
 * - Asset Efficiency
 */
export function analyzeMoat(history: FinancialPeriod[]): AnalysisScore {
  if (!history || history.length < 3) {
    return { score: 0, maxScore: 5, details: ["Insufficient historical data for moat analysis"] };
  }

  // Sort history by date descending (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let score = 0;
  const maxScore = 5;
  const details: string[] = [];

  // 1. ROE Consistency (>15%)
  const highRoeYears = sortedHistory.filter(p => (p.roe || 0) > 0.15).length;
  const roeConsistency = highRoeYears / sortedHistory.length;
  const avgRoe = sortedHistory.reduce((sum, p) => sum + (p.roe || 0), 0) / sortedHistory.length;

  if (roeConsistency >= 0.8) {
    score += 2;
    details.push(`Strong Moat: Excellent ROE consistency (${highRoeYears}/${sortedHistory.length} years > 15%, avg ${(avgRoe * 100).toFixed(1)}%)`);
  } else if (roeConsistency >= 0.5) {
    score += 1;
    details.push(`Moderate Moat: Good ROE performance (${highRoeYears}/${sortedHistory.length} years > 15%)`);
  } else {
    details.push(`Weak Moat: Inconsistent ROE (avg ${(avgRoe * 100).toFixed(1)}%)`);
  }

  // 2. Margin Stability (Pricing Power)
  const margins = sortedHistory.map(p => p.operatingMargin || 0).filter(m => m !== 0);
  if (margins.length >= 3) {
    const recentAvg = (margins[0] + margins[1]) / 2; // Avg of last 2 years
    const olderAvg = (margins[margins.length - 1] + margins[margins.length - 2]) / 2; // Avg of first 2 years

    if (recentAvg > olderAvg) {
      score += 1;
      details.push("Pricing Power: Operating margins are expanding over time");
    } else if ((olderAvg - recentAvg) < 0.02) { // Stable within 2%
      score += 0.5;
      details.push("Pricing Power: Operating margins are stable");
    } else {
      details.push("No Pricing Power: Operating margins are declining");
    }
  }

  // 3. Return on Invested Capital (ROIC) - Optional but powerful
  // If we have ROIC data, we can boost the score
  const avgRoic = sortedHistory.reduce((sum, p) => sum + (p.roic || 0), 0) / sortedHistory.length;
  if (avgRoic > 0.12) {
    score += 1;
    details.push(`Capital Efficiency: High average ROIC (${(avgRoic * 100).toFixed(1)}%)`);
  }

  // CAP Score to Max
  score = Math.min(score, maxScore);

  return { score, maxScore, details };
}

/**
 * 2. Analyze Consistency
 * Checks for consistent growth in Revenue and EPS
 */
export function analyzeConsistency(history: FinancialPeriod[]): AnalysisScore {
  if (!history || history.length < 3) {
    return { score: 0, maxScore: 5, details: ["Insufficient data for consistency check"] };
  }

  // Newest first
  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let score = 0;
  const maxScore = 5;
  const details: string[] = [];

  // EPS Growth Consistency
  // Check if EPS has increased year over year
  let growthYears = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if ((sorted[i].eps || 0) > (sorted[i+1].eps || 0)) {
      growthYears++;
    }
  }
  
  const consistencyRate = growthYears / (sorted.length - 1);
  if (consistencyRate >= 0.8) {
    score += 3;
    details.push(`Earnings Machine: Consistent EPS growth in ${growthYears}/${sorted.length - 1} periods`);
  } else if (consistencyRate >= 0.6) {
    score += 1;
    details.push(`Growing: EPS grew in ${growthYears}/${sorted.length - 1} periods`);
  } else {
    details.push(`Inconsistent: Earnings are volatile`);
  }

  // Revenue Growth check
  const latestRev = sorted[0].revenue || 0;
  const oldestRev = sorted[sorted.length - 1].revenue || 0;
  if (latestRev > oldestRev * 1.5) { // 50% growth over periods
    score += 2;
    details.push("Growth: Revenue has grown significantly over the period");
  } else if (latestRev > oldestRev) {
    score += 1;
    details.push("Growth: Revenue is growing");
  }

  return { score: Math.min(score, maxScore), maxScore, details };
}

/**
 * 3. Calculate Intrinsic Value (Simplified DCF)
 * Uses Free Cash Flow (FCF) or Owner Earnings proxy
 */
export function calculateIntrinsicValue(history: FinancialPeriod[], currentPrice: number): IntrinsicValueResult {
  if (!history || history.length < 3) {
    return { 
      intrinsicValue: 0, 
      description: "Insufficient data", 
      assumptions: {}, 
      details: ["Need at least 3 years of data"] 
    };
  }

  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0];

  // 1. Determine Base "Owner Earnings"
  // Prefer Free Cash Flow, fallback to Net Income
  const baseEarnings = latest.freeCashFlow && latest.freeCashFlow > 0 
    ? latest.freeCashFlow 
    : (latest.netIncome || 0);

  if (baseEarnings <= 0) {
    return {
      intrinsicValue: 0,
      description: "Negative Earnings",
      assumptions: {},
      details: ["Company currently has negative earnings/FCF, standard DCF not applicable"]
    };
  }

  // 2. Estimate Growth Rate
  // CAGR of last 3-5 years (capped conservatively)
  let growthRate = 0.05; // Default 5%
  const oldest = sorted[Math.min(sorted.length, 5) - 1]; // Go back up to 5 years
  
  if (oldest.freeCashFlow && oldest.freeCashFlow > 0) {
    const years = Math.min(sorted.length, 5) - 1;
    // CAGR formula
    const cagr = Math.pow((baseEarnings / oldest.freeCashFlow), (1 / years)) - 1;
    // Cap growth at 15% for sanity, floor at 2%
    growthRate = Math.min(Math.max(cagr, 0.02), 0.15);
  }

  // 3. Discount Rate
  // Buffett uses RF (Risk Free) + Risk Premium. Let's use 10% conservative.
  const discountRate = 0.10;
  const terminalGrowthRate = 0.03;

  // 4. Calculate DCF (2 Stage)
  // Stage 1: 5 Years of growth
  let sumPv = 0;
  let futureValue = baseEarnings;
  
  for (let i = 1; i <= 5; i++) {
    futureValue = futureValue * (1 + growthRate);
    sumPv += futureValue / Math.pow(1 + discountRate, i);
  }

  // Stage 2: Terminal Value
  const terminalValue = (futureValue * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
  const terminalPv = terminalValue / Math.pow(1 + discountRate, 5);

  const totalValue = sumPv + terminalPv;
  
  // Convert to per-share if we had shares outstanding, but we usually analyse market cap relative
  // So let's return total company value relative to market cap logic
  // WAIT - we prefer per share price.
  // We need shares outstanding. Often not in history object directly in this simplified type.
  // We'll return the Raw Total Value (Market Cap equivalent).
  // The caller needs to compare this to Market Cap.

  return {
    intrinsicValue: totalValue,
    description: "2-Stage DCF Model (5y High Growth + Terminal)",
    assumptions: {
      growthRate,
      discountRate,
      terminalGrowthRate,
      baseEarnings
    },
    details: [
      `Base Earnings (FCF/NI): $${(baseEarnings / 1e9).toFixed(2)}B`,
      `Implied Growth Rate: ${(growthRate * 100).toFixed(1)}%`,
      `Discount Rate: ${(discountRate * 100).toFixed(1)}%`,
      `Calculated Intrinsic Market Value: $${(totalValue / 1e9).toFixed(2)}B`
    ]
  };
}
