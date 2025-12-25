/**
 * AI Agent Types for Stock Analysis
 */

export interface FinancialPeriod {
  date: string;
  revenue?: number;
  netIncome?: number;
  eps?: number;
  freeCashFlow?: number;
  grossMargin?: number;
  operatingMargin?: number;
  roe?: number;
  roic?: number;
  debtToEquity?: number;
  bookValuePerShare?: number;
  currentRatio?: number;
  assetTurnover?: number;
}

export interface MarketData {
  ticker: string;
  currentPrice: number;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  debtToEquity?: number;
  roe?: number;
  revenueGrowth?: number;
  earningsGrowth?: number;
  freeCashFlow?: number;
  dividendYield?: number;
  beta?: number;
  // Historical data for quantitative analysis
  financialHistory?: FinancialPeriod[];
  // News and sentiment data
  recentNews?: Array<{
    headline: string;
    summary: string;
    source: string;
    sentiment: string;
    publishedAt: string;
  }>;
  // Insider trading
  insiderTransactions?: Array<{
    name: string;
    position: string;
    transactionType: string;
    shares: number;
    value: number;
    date: string;
  }>;
}

export interface AgentResult {
  agentName: string;
  analysis: string;
  keyPoints: string[];
  score?: number; // 0-100 rating
  timestamp: Date;
}

export interface ValuationResult extends AgentResult {
  agentName: 'Valuation';
  intrinsicValue?: number;
  targetPrice?: number;
  upside?: number; // percentage
}

export interface SentimentResult extends AgentResult {
  agentName: 'Sentiment';
  overallSentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sentimentScore: number; // -100 to 100
}

export interface FundamentalResult extends AgentResult {
  agentName: 'Fundamental';
  financialHealth: 'Strong' | 'Moderate' | 'Weak';
  growthPotential: 'High' | 'Medium' | 'Low';
}

export interface RiskResult extends AgentResult {
  agentName: 'Risk';
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
  // Position Sizing
  positionSize?: number;    // Number of shares to buy
  positionValue?: number;   // Dollar value of position
  portfolioWeight?: number; // % of portfolio
}

export interface TechnicalResult extends AgentResult {
  agentName: 'Technical';
  trend: 'Bullish' | 'Neutral' | 'Bearish';
  momentum: 'Strong' | 'Moderate' | 'Weak';
  supportLevel?: number;
  resistanceLevel?: number;
}

export interface PeerComparisonResult extends AgentResult {
  agentName: 'PeerComparison';
  relativeValuation: 'Undervalued' | 'FairlyValued' | 'Overvalued';
  competitivePosition: 'Leader' | 'Strong' | 'Average' | 'Weak';
  topPeers: string[];
}

export interface MacroResult extends AgentResult {
  agentName: 'Macro';
  economicOutlook: 'Favorable' | 'Neutral' | 'Unfavorable';
  sectorTrend: 'Tailwind' | 'Neutral' | 'Headwind';
  interestRateSensitivity: 'High' | 'Medium' | 'Low';
}

export interface EarningsCallResult extends AgentResult {
  agentName: 'EarningsCall';
  managementTone: 'Confident' | 'Cautious' | 'Uncertain';
  guidanceDirection: 'Raising' | 'Maintaining' | 'Lowering';
  keyThemes: string[];
}

export interface PortfolioManagerResult {
  finalReport: string;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidenceScore: number; // 0-100
  targetPrice?: number;
  timeHorizon: string;
  keyTakeaways: string[];
}

export interface WarrenBuffettResult extends AgentResult {
  agentName: 'WarrenBuffett';
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  moatScore: number;
  intrinsicValue: number;
  marginOfSafety: number;
}

// Generic interface for all persona agents
export interface PersonaAgentResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

export interface AnalysisResult {
  ticker: string;
  marketData: MarketData;
  valuation: ValuationResult;
  sentiment: SentimentResult;
  fundamental: FundamentalResult;
  risk: RiskResult;
  technical?: TechnicalResult;
  peerComparison?: PeerComparisonResult;
  macro?: MacroResult;
  earningsCall?: EarningsCallResult;
  warrenBuffett?: WarrenBuffettResult;
  personaAgents?: Record<string, PersonaAgentResult>;
  portfolioManager: PortfolioManagerResult;
  processingTime: number; // milliseconds
}

