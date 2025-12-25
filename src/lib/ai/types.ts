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

export interface TradeSetup {
  suggestedAction: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: number;
  upside: number; // percentage
  downside: number; // percentage
  reasoning: string;
}

export interface RiskResult {
  analysis: string; // Detailed risk analysis text
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
  maxDrawdown?: number;
  volatility?: number; // Annualized volatility
  sharpeRatio?: number;
  suggestedStopLoss?: number; // Volatility-based stop level
  // Position Sizing
  positionSize?: number; // Number of shares
  positionValue?: number; // Dollar value
  portfolioWeight?: number; // Percentage of portfolio
  score?: number; // 0-100 rating
  timestamp?: Date;
}

export interface TechnicalResult extends AgentResult {
  agentName: 'Technical';
  trend: 'Bullish' | 'Neutral' | 'Bearish';
  momentum: 'Strong' | 'Moderate' | 'Weak';
  signal: 'Bullish' | 'Bearish' | 'Neutral'; // Added signal field
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
  agentName?: string;
  timestamp?: Date;
  finalReport?: string; // Optional legacy field
  analysis?: string; // New field matching other agents
  summary?: string;
  rating: 'BUY' | 'HOLD' | 'SELL';
  recommendation?: 'BUY' | 'HOLD' | 'SELL'; // Optional legacy field
  confidence: number;
  confidenceScore?: number; // Optional legacy field
  targetPrice?: number;
  timeHorizon: string;
  investmentThesis?: string[];
  keyTakeaways?: string[]; // Optional legacy field
  catalysts?: string[];
  riskFactors?: string[];
  riskLevel?: string;
  quantity?: number;
  tradeSetup?: TradeSetup;
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

