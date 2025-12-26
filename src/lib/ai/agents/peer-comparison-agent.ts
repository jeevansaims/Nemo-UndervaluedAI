/**
 * Peer Comparison Agent - Compares stock against industry competitors
 * Based on undervalued.ai's methodology
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, AgentResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PeerComparisonResult extends AgentResult {
  agentName: 'PeerComparison';
  relativeValuation: 'Undervalued' | 'FairlyValued' | 'Overvalued';
  competitivePosition: 'Leader' | 'Strong' | 'Average' | 'Weak';
  topPeers: string[];
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
    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}
Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
P/E Ratio: ${marketData.peRatio || 'N/A'}
P/B Ratio: ${marketData.pbRatio || 'N/A'}
ROE: ${marketData.roe ? (marketData.roe * 100).toFixed(2) + '%' : 'N/A'}
Revenue Growth: ${marketData.revenueGrowth ? (marketData.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${PEER_COMPARISON_PROMPT}\n\nAnalyze the following stock:\n\n${dataContext}\n\nProvide your peer comparison analysis.`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse results
    const valuationMatch = analysis.match(/relative\s+valuation[:\s]+(undervalued|fairly\s*valued|overvalued)/i);
    const positionMatch = analysis.match(/competitive\s+position[:\s]+(leader|strong|average|weak)/i);
    
    // Extract peer names (look for ticker patterns)
    const peerMatches = analysis.match(/\b([A-Z]{2,5})\b/g) || [];
    const topPeers = [...new Set(peerMatches)]
      .filter(p => p !== marketData.ticker && p.length >= 2)
      .slice(0, 5);

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
      topPeers,
      score: relativeValuation === 'Undervalued' ? 75 : relativeValuation === 'Overvalued' ? 35 : 50,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Peer comparison agent error:', error);
    throw new Error(`Peer comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
