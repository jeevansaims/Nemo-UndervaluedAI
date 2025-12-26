/**
 * Peer Comparison Agent - Compares stock against industry competitors
 * Based on undervalued.ai's methodology
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, AgentResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PeerData {
  ticker: string;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  netMargin?: number;
  debtToEquity?: number;
  currentPrice?: number;
}

export interface PeerComparisonResult extends AgentResult {
  agentName: 'PeerComparison';
  relativeValuation: 'Undervalued' | 'FairlyValued' | 'Overvalued';
  competitivePosition: 'Leader' | 'Strong' | 'Average' | 'Weak';
  topPeers: string[];
  peerData?: PeerData[];
}

// Industry peer mappings - common competitors by sector
const INDUSTRY_PEERS: Record<string, string[]> = {
  // Tech
  'AAPL': ['MSFT', 'GOOGL', 'META', 'AMZN'],
  'MSFT': ['AAPL', 'GOOGL', 'META', 'AMZN'],
  'GOOGL': ['MSFT', 'AAPL', 'META', 'AMZN'],
  'META': ['GOOGL', 'SNAP', 'PINS', 'TWTR'],
  'AMZN': ['WMT', 'TGT', 'COST', 'BABA'],
  'NVDA': ['AMD', 'INTC', 'AVGO', 'QCOM'],
  'AMD': ['NVDA', 'INTC', 'AVGO', 'QCOM'],
  'TSLA': ['F', 'GM', 'RIVN', 'LCID'],
  'MSTR': ['COIN', 'MARA', 'RIOT', 'CLSK'],
  // Finance
  'JPM': ['BAC', 'WFC', 'C', 'GS'],
  'BAC': ['JPM', 'WFC', 'C', 'USB'],
  'V': ['MA', 'AXP', 'PYPL', 'SQ'],
  'MA': ['V', 'AXP', 'PYPL', 'SQ'],
  // Healthcare
  'JNJ': ['PFE', 'ABBV', 'MRK', 'LLY'],
  'UNH': ['CVS', 'CI', 'HUM', 'ANTM'],
  // Default fallback
  'DEFAULT': ['SPY'] // S&P 500 as baseline
};

async function fetchPeerData(ticker: string): Promise<PeerData | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;

  try {
    // Fetch quote
    const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`);
    const quote = await quoteRes.json();

    // Fetch profile
    const profileRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`);
    const profile = await profileRes.json();

    // Fetch metrics
    const metricsRes = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${apiKey}`);
    const metrics = await metricsRes.json();

    return {
      ticker,
      currentPrice: quote.c || undefined,
      marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1e6 : undefined,
      peRatio: metrics.metric?.peBasicExclExtraTTM || undefined,
      pbRatio: metrics.metric?.pbAnnual || undefined,
      netMargin: metrics.metric?.netProfitMarginTTM || undefined,
      debtToEquity: metrics.metric?.totalDebt2TotalEquityAnnual || undefined,
    };
  } catch (error) {
    console.error(`Failed to fetch peer data for ${ticker}:`, error);
    return null;
  }
}

const PEER_COMPARISON_PROMPT = `You are a competitive analysis expert specializing in equity research.

Your task is to compare the given stock against its direct industry competitors:

1. Relative Valuation Analysis
   - Compare P/E, P/B, EV/EBITDA vs sector peers
   - Identify if the stock trades at a premium or discount

2. Competitive Positioning Assessment
   - Market share and moat analysis
   - Brand strength and pricing power
   - Innovation and R&D capabilities

3. Profitability Chain Analysis
   - Compare gross margin → operating margin → net margin vs peers
   - Identify efficiency advantages or disadvantages

4. Growth Comparison
   - Revenue and earnings growth rates vs peers
   - Market opportunity capture

Provide a clear assessment of:
- Relative Valuation: Undervalued, FairlyValued, or Overvalued (vs peers)
- Competitive Position: Leader, Strong, Average, or Weak
- Top 3-5 comparable peers for this stock`;

export async function runPeerComparisonAgent(
  marketData: MarketData
): Promise<PeerComparisonResult> {
  try {
    // Get peer tickers for this stock
    const peerTickers = INDUSTRY_PEERS[marketData.ticker] || INDUSTRY_PEERS['DEFAULT'];

    // Fetch peer data in parallel
    console.log(`Fetching peer data for ${marketData.ticker} competitors: ${peerTickers.join(', ')}`);
    const peerDataPromises = peerTickers.map(ticker => fetchPeerData(ticker));
    const peerDataResults = await Promise.all(peerDataPromises);
    const peerData = peerDataResults.filter((data): data is PeerData => data !== null);

    // Build comparison context
    let peerContext = '';
    if (peerData.length > 0) {
      peerContext = '\n\nCOMPETITOR DATA:\n';
      peerData.forEach(peer => {
        peerContext += `\n${peer.ticker}:
- Market Cap: ${peer.marketCap ? `$${(peer.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
- P/E Ratio: ${peer.peRatio?.toFixed(2) || 'N/A'}
- P/B Ratio: ${peer.pbRatio?.toFixed(2) || 'N/A'}
- Net Margin: ${peer.netMargin ? `${(peer.netMargin * 100).toFixed(2)}%` : 'N/A'}
- Debt/Equity: ${peer.debtToEquity?.toFixed(2) || 'N/A'}`;
      });
    }

    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}
Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
P/E Ratio: ${marketData.peRatio || 'N/A'}
P/B Ratio: ${marketData.pbRatio || 'N/A'}
ROE: ${marketData.roe ? (marketData.roe * 100).toFixed(2) + '%' : 'N/A'}
Revenue Growth: ${marketData.revenueGrowth ? (marketData.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
${peerContext}
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${PEER_COMPARISON_PROMPT}\n\nAnalyze the following stock and compare it to its competitors:\n\n${dataContext}\n\nProvide your detailed peer comparison analysis.`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse results
    const valuationMatch = analysis.match(/relative\s+valuation[:\s]+(undervalued|fairly\s*valued|overvalued)/i);
    const positionMatch = analysis.match(/competitive\s+position[:\s]+(leader|strong|average|weak)/i);

    const relativeValuation = valuationMatch
      ? (valuationMatch[1].replace(/\s/g, '') as 'Undervalued' | 'FairlyValued' | 'Overvalued')
      : 'FairlyValued';

    const competitivePosition = positionMatch
      ? (positionMatch[1].charAt(0).toUpperCase() + positionMatch[1].slice(1).toLowerCase() as 'Leader' | 'Strong' | 'Average' | 'Weak')
      : 'Average';

    // Extract key points
    const keyPoints = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 4);

    return {
      agentName: 'PeerComparison',
      analysis,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['See full analysis for peer details'],
      relativeValuation,
      competitivePosition,
      topPeers: peerTickers,
      peerData,
      score: relativeValuation === 'Undervalued' ? 75 : relativeValuation === 'Overvalued' ? 35 : 50,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Peer comparison agent error:', error);
    throw new Error(`Peer comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
