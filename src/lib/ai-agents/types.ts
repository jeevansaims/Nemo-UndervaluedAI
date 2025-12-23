// AI Agent Types and Interfaces

export interface MarketData {
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

export interface AgentAnalysis {
  score: number;        // 0-100
  confidence: number;   // 0-100
  reasoning: string;
  metrics: Record<string, any>;
}

export interface ValuationAnalysis extends AgentAnalysis {
  intrinsicValue?: number;
  upside?: number;      // percentage upside/downside
}

export interface SentimentAnalysis extends AgentAnalysis {
  bullish: boolean;
}

export interface RiskAnalysis extends AgentAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TechnicalAnalysis extends AgentAnalysis {
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface PortfolioDecision {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  targetPrice?: number;
  confidence: number;     // 0-100 (aggregated from all agents)
  reasoning: string;

  // Individual agent scores
  valuationScore: number;
  sentimentScore: number;
  riskScore: number;
  technicalScore: number;
}
