// Generate realistic fund performance data
// Used for seeding and demo purposes

interface PerformancePoint {
  date: Date;
  value: number;
}

interface FundConfig {
  startValue: number;
  annualReturn: number; // e.g., 0.15 for 15% annual return
  volatility: number; // e.g., 0.12 for 12% annual volatility
  days: number;
}

/**
 * Generate realistic equity curve using geometric Brownian motion
 * Simulates stock market-like performance with drift and volatility
 */
export function generatePerformanceCurve(config: FundConfig): PerformancePoint[] {
  const { startValue, annualReturn, volatility, days } = config;
  const points: PerformancePoint[] = [];
  
  // Daily drift and volatility
  const dt = 1 / 252; // Trading days per year
  const drift = annualReturn * dt;
  const vol = volatility * Math.sqrt(dt);
  
  let value = startValue;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    
    // Random walk with drift
    const randomShock = (Math.random() - 0.5) * 2; // -1 to 1
    const dailyReturn = drift + vol * randomShock;
    value = value * (1 + dailyReturn);
    
    points.push({
      date: new Date(date.setHours(0, 0, 0, 0)),
      value: Math.round(value * 100) / 100,
    });
  }
  
  return points;
}

/**
 * Calculate fund metrics from performance series
 */
export function calculateFundMetrics(performance: PerformancePoint[]) {
  if (performance.length < 2) {
    return null;
  }
  
  const startValue = performance[0].value;
  const endValue = performance[performance.length - 1].value;
  const totalReturn = ((endValue - startValue) / startValue) * 100;
  
  // Calculate daily returns
  const dailyReturns = [];
  for (let i = 1; i < performance.length; i++) {
    const ret = (performance[i].value - performance[i - 1].value) / performance[i - 1].value;
    dailyReturns.push(ret);
  }
  
  // Calculate volatility (annualized)
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance * 252) * 100;
  
  // Calculate max drawdown
  let maxValue = performance[0].value;
  let maxDrawdown = 0;
  
  for (const point of performance) {
    if (point.value > maxValue) {
      maxValue = point.value;
    }
    const drawdown = ((point.value - maxValue) / maxValue) * 100;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  // Calculate Sharpe ratio (assuming 4% risk-free rate)
  const riskFreeRate = 0.04 / 252; // Daily risk-free rate
  const excessReturns = dailyReturns.map(r => r - riskFreeRate);
  const avgExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgExcessReturn / stdDev) * Math.sqrt(252) : 0;
  
  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    currentValue: endValue,
    startValue,
  };
}

/**
 * Generate diversified portfolio holdings
 */
export function generateHoldings(fundType: 'growth' | 'value' | 'dividend') {
  const growthStocks = [
    { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
    { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Cyclical' },
    { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
    { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
    { ticker: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Technology' },
  ];
  
  const valueStocks = [
    { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financial Services' },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
    { ticker: 'BAC', name: 'Bank of America Corp.', sector: 'Financial Services' },
    { ticker: 'WFC', name: 'Wells Fargo & Co.', sector: 'Financial Services' },
    { ticker: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
    { ticker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
    { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  ];
  
  const dividendStocks = [
    { ticker: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Defensive' },
    { ticker: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Defensive' },
    { ticker: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
    { ticker: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services' },
    { ticker: 'T', name: 'AT&T Inc.', sector: 'Communication Services' },
    { ticker: 'MO', name: 'Altria Group Inc.', sector: 'Consumer Defensive' },
    { ticker: 'MMM', name: '3M Co.', sector: 'Industrials' },
  ];
  
  const stockPool = fundType === 'growth' ? growthStocks : 
                    fundType === 'value' ? valueStocks : 
                    dividendStocks;
  
  // Select 10-12 stocks
  const numHoldings = 10 + Math.floor(Math.random() * 3);
  const selectedStocks = [...stockPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, numHoldings);
  
  // Generate weights that sum to ~100%
  let weights = selectedStocks.map(() => Math.random());
  const sum = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => (w / sum) * 100);
  
  return selectedStocks.map((stock, i) => ({
    ...stock,
    weightPct: Math.round(weights[i] * 100) / 100,
    rationale: generateRationale(stock.ticker, fundType),
  }));
}

function generateRationale(ticker: string, fundType: string): string {
  const rationales = {
    growth: [
      'Strong revenue growth trajectory',
      'Market leadership in expanding sector',
      'Innovation-driven moat',
      'Scalable business model',
    ],
    value: [
      'Trading below intrinsic value',
      'Strong balance sheet, undervalued',
      'Cyclical opportunity',
      'Dividend yield with value upside',
    ],
    dividend: [
      'Consistent dividend growth history',  
      'Defensive cash flow generation',
      'Yield + stability combination',
      'Shareholder-friendly capital allocation',
    ],
  };
  
  const list = rationales[fundType as keyof typeof rationales] || rationales.growth;
  return list[Math.floor(Math.random() * list.length)];
}

export const FUND_CONFIGS = {
  'ai-growth-fund': {
    name: 'AI Growth Fund',
    slug: 'ai-growth-fund',
    description: 'High-growth technology and innovation leaders selected by AI analysis',
    type: 'growth' as const,
    performance: {
      startValue: 100,
      annualReturn: 0.28, // 28% annual return
      volatility: 0.18, // 18% volatility
      days: 365,
    },
  },
  'ai-value-fund': {
    name: 'AI Value Fund',
    slug: 'ai-value-fund',
    description: 'Undervalued quality companies identified through AI fundamental analysis',
    type: 'value' as const,
    performance: {
      startValue: 100,
      annualReturn: 0.16, // 16% annual return
      volatility: 0.12, // 12% volatility
      days: 365,
    },
  },
  'ai-dividend-fund': {
    name: 'AI Dividend Fund',
    slug: 'ai-dividend-fund',
    description: 'Income-focused portfolio of dividend aristocrats selected by AI',
    type: 'dividend' as const,
    performance: {
      startValue: 100,
      annualReturn: 0.12, // 12% annual return
      volatility: 0.08, // 8% volatility
      days: 365,
    },
  },
};

/**
 * Get fund methodology description
 */
export function getFundMethodology(fundSlug: string) {
  const methodologies: Record<string, any> = {
    'ai-growth-fund': {
      universe: 'NYSE and Nasdaq equities with market capitalization ≥ $1B, focusing on Technology, Consumer Cyclical, and Communication Services sectors.',
      selection: 'The process begins with an initial screen on metrics such as revenue growth (≥20% YoY), P/S ratio, and innovation indicators. An AI-based analysis then identifies Strong Buy candidates with high growth potential, typically around 100 to 200 stocks. The final portfolio is constructed from these candidates via a multi-step AI selection process.',
      rebalancing: 'Triggered by either macroeconomic research, sector rotation signals, or changes in internal stock ratings. On trigger, the system performs a full portfolio rebalance with risk-adjusted position sizing.',
    },
    'ai-value-fund': {
      universe: 'NYSE and Nasdaq equities, excluding Financial Services and Real Estate sectors. Market capitalization ≥ $500M.',
      selection: 'Initial screening on value metrics: P/E < market average, P/B < 3, positive free cash flow. AI analysis evaluates balance sheet quality, earnings consistency, and catalyst potential to identify undervalued opportunities.',
      rebalancing: 'Quarterly rebalancing or triggered by significant valuation changes (±20%). Positions are sized based on discount to intrinsic value and quality scores.',
    },
    'ai-dividend-fund': {
      universe: 'Large-cap US equities (market cap ≥ $10B) with dividend history ≥ 10 years and payout ratio < 80%.',
      selection: 'Screens for dividend yield ≥ 2%, dividend growth ≥ 5% over 5 years, and payout sustainability. AI evaluates business model durability and cash flow stability.',
      rebalancing: 'Semi-annual rebalancing. Positions are weighted by dividend sustainability score and yield-adjusted quality metrics.',
    },
  };

  return methodologies[fundSlug] || methodologies['ai-growth-fund'];
}

/**
 * Generate sector allocation from holdings
 */
export function generateSectorAllocation(holdings: any[]) {
  const sectorCounts: Record<string, number> = {};
  
  holdings.forEach(holding => {
    const sector = holding.sector || 'Other';
    sectorCounts[sector] = (sectorCounts[sector] || 0) + holding.weightPct;
  });

  // Round to 1 decimal
  Object.keys(sectorCounts).forEach(sector => {
    sectorCounts[sector] = Math.round(sectorCounts[sector] * 10) / 10;
  });

  return sectorCounts;
}

/**
 * Generate geographic allocation (mock data based on fund type)
 */
export function generateGeoAllocation(fundSlug: string) {
  const allocations: Record<string, any> = {
    'ai-growth-fund': {
      'United States': 85,
      'China': 8,
      'Taiwan': 4,
      'South Korea': 3,
    },
    'ai-value-fund': {
      'United States': 75,
      'United Kingdom': 10,
      'Canada': 8,
      'Germany': 4,
      'France': 3,
    },
    'ai-dividend-fund': {
      'United States': 90,
      'United Kingdom': 5,
      'Canada': 3,
      'Switzerland': 2,
    },
  };

  return allocations[fundSlug] || allocations['ai-growth-fund'];
}

/**
 * Generate market cap allocation (mock data based on fund type)
 */
export function generateMarketCapAllocation(fundSlug: string) {
  const allocations: Record<string, any> = {
    'ai-growth-fund': {
      'LargeCap': 70,
      'MidCap': 25,
      'SmallCap': 5,
    },
    'ai-value-fund': {
      'LargeCap': 60,
      'MidCap': 30,
      'SmallCap': 10,
    },
    'ai-dividend-fund': {
      'LargeCap': 95,
      'MidCap': 5,
      'SmallCap': 0,
    },
  };

  return allocations[fundSlug] || allocations['ai-growth-fund'];
}

