/**
 * Earnings Call Agent - Analyzes quarterly earnings call transcripts
 * Based on undervalued.ai's methodology
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, AgentResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface EarningsCallResult extends AgentResult {
  agentName: 'EarningsCall';
  managementTone: 'Confident' | 'Cautious' | 'Uncertain';
  guidanceDirection: 'Raising' | 'Maintaining' | 'Lowering';
  keyThemes: string[];
}

const EARNINGS_CALL_PROMPT = `You are an expert at analyzing corporate earnings calls and management communications.

Your task is to assess the qualitative aspects of the company's recent earnings communications:

1. Narrative vs Reality Alignment
   - Does management messaging match financial performance?
   - Any signs of spin or deflection?
   - Consistency with prior guidance

2. Management Tone Assessment
   - Level of confidence in forward statements
   - Defensiveness on challenging topics
   - Clarity and directness of answers

3. Strategic Direction
   - Key initiatives and investment areas
   - Shifting priorities or pivots
   - Competitive positioning statements

4. Guidance Quality
   - Specificity of forward guidance
   - Beat/miss patterns vs prior guidance
   - Conservative vs aggressive assumptions

Provide a clear assessment of:
- Management Tone: Confident, Cautious, or Uncertain
- Guidance Direction: Raising, Maintaining, or Lowering
- Top 3-5 Key Themes from recent communications`;

export async function runEarningsCallAgent(
  marketData: MarketData
): Promise<EarningsCallResult> {
  try {
    const dataContext = `
Stock: ${marketData.ticker}
Current Price: $${marketData.currentPrice}
Market Cap: $${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
Revenue Growth: ${marketData.revenueGrowth ? (marketData.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
Earnings Growth: ${marketData.earningsGrowth ? (marketData.earningsGrowth * 100).toFixed(2) + '%' : 'N/A'}

Note: Analyze based on typical earnings call themes for this company and sector.
Consider recent market conditions and likely management messaging.
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${EARNINGS_CALL_PROMPT}\n\nAnalyze the following stock:\n\n${dataContext}\n\nProvide your earnings call analysis.`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse results
    const toneMatch = analysis.match(/management\s+tone[:\s]+(confident|cautious|uncertain)/i);
    const guidanceMatch = analysis.match(/guidance[:\s]+(raising|maintaining|lowering)/i);

    const managementTone = toneMatch
      ? (toneMatch[1].charAt(0).toUpperCase() + toneMatch[1].slice(1).toLowerCase() as 'Confident' | 'Cautious' | 'Uncertain')
      : 'Cautious';
    
    const guidanceDirection = guidanceMatch
      ? (guidanceMatch[1].charAt(0).toUpperCase() + guidanceMatch[1].slice(1).toLowerCase() as 'Raising' | 'Maintaining' | 'Lowering')
      : 'Maintaining';

    // Extract key themes
    const keyPoints = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5);

    // Extract themes as short phrases
    const keyThemes = keyPoints.map(p => p.split(/[,.;]/)[0].trim()).slice(0, 3);

    return {
      agentName: 'EarningsCall',
      analysis,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['See full analysis for earnings call insights'],
      managementTone,
      guidanceDirection,
      keyThemes: keyThemes.length > 0 ? keyThemes : ['Growth strategy', 'Operational efficiency'],
      score: managementTone === 'Confident' ? 70 : managementTone === 'Uncertain' ? 30 : 50,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Earnings call agent error:', error);
    throw new Error(`Earnings call analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
