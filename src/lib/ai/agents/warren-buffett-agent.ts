/**
 * Warren Buffett Agent
 * Combines quantitative logic (Moat, Consistency, DCF) with LLM Qualitative reasoning.
 * Ported from virattt/ai-hedge-fund logic.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, AgentResult, WarrenBuffettResult } from '../types';
import { 
  analyzeMoat, 
  analyzeConsistency, 
  calculateIntrinsicValue,
  analyzeMoat as analyzePricingPower // Reusing moat logic logic for pricing power part
} from '../financial-analysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function runWarrenBuffettAgent(marketData: MarketData): Promise<WarrenBuffettResult> {
  // 1. Run Quantitative Analysis first
  const history = marketData.financialHistory || [];
  
  // A. Moat Analysis
  const moatAnalysis = analyzeMoat(history);
  
  // B. Consistency Analysis
  const consistencyAnalysis = analyzeConsistency(history);
  
  // C. Intrinsic Value Analysis
  const ivAnalysis = calculateIntrinsicValue(history, marketData.currentPrice);
  
  // D. Calculate Margin of Safety
  // Market cap vs Intrinsic Value (Total)
  let marginOfSafety = 0;
  if (ivAnalysis.intrinsicValue > 0 && marketData.marketCap) {
    marginOfSafety = (ivAnalysis.intrinsicValue - marketData.marketCap) / marketData.marketCap;
  }

  // E. Management Score (Simplified based on available snapshot data)
  // Check for buybacks (share count reduction) or dividends
  // Note: We need share count history for sophisticated check, using rough proxy from Finnhub if available
  // Fallback to checking ROE/RoIC as management proxy
  const mgmtScore = (marketData.roe || 0) > 0.15 ? "Strong" : (marketData.roe || 0) > 0.08 ? "Moderate" : "Weak";

  // 2. Prepare Context for LLM
  const quantSummary = `
QUANTITATIVE ANALYSIS RESULTS:
------------------------------
1. ECONOMIC MOAT (Score: ${moatAnalysis.score}/5):
${moatAnalysis.details.map(d => `- ${d}`).join('\n')}

2. FINANCIAL CONSISTENCY (Score: ${consistencyAnalysis.score}/5):
${consistencyAnalysis.details.map(d => `- ${d}`).join('\n')}

3. VALUATION (Intrinsic Value):
${ivAnalysis.details.map(d => `- ${d}`).join('\n')}
Margin of Safety: ${(marginOfSafety * 100).toFixed(1)}% ${(marginOfSafety > 0 ? "(Undervalued)" : "(Overvalued)")}

4. MANAGEMENT PROXY:
Rating: ${mgmtScore} (Based on ROE: ${(marketData.roe ? (marketData.roe * 100).toFixed(1) : 0)}%)
`;

  const prompt = `You are Warren Buffett. Decide Bullish, Bearish, or Neutral using ONLY the provided facts.

Checklist for decision:
1. Circle of competence (Can we understand this business?)
2. Competitive Moat (Quantitative Score: ${moatAnalysis.score}/5)
3. Management Quality (Proxy: ${mgmtScore})
4. Financial Strength (Consistency Score: ${consistencyAnalysis.score}/5)
5. Valuation (Margin of Safety: ${(marginOfSafety * 100).toFixed(1)}%)

Signal Rules:
- Bullish: Strong Moat (>3) AND Consistency (>3) AND Margin of Safety > 0.
- Bearish: Weak Moat (<2) OR Significantly Overvalued (Margin of Safety < -30%).
- Neutral: Good business but fair/expensive price, or mixed signals.

Return a JSON with your decision.
Format:
{
  "signal": "Bullish" | "Bearish" | "Neutral",
  "confidence": number (0-100),
  "reasoning": "Concise Buffett-style explanation (< 200 chars)"
}`;

  // 3. Call LLM for final synthesis
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1000,
    temperature: 0.1,
    messages: [
      {
        role: 'user',
        content: `Ticker: ${marketData.ticker}\n\n${quantSummary}\n\n${prompt}`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  // Parse JSON output
  let result = { signal: 'Neutral', confidence: 50, reasoning: 'Analysis failed to parse' };
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse Buffett agent response", e);
  }

  // Construct final analysis text for display
  const analysisText = `
### Warren Buffett Analysis
**Signal: ${result.signal}** (Confidence: ${result.confidence}%)

**Reasoning:** ${result.reasoning}

**Quantitative Metrics:**
- **Moat Score:** ${moatAnalysis.score}/5
- **Consistency Score:** ${consistencyAnalysis.score}/5
- **Intrinsic Value:** $${(ivAnalysis.intrinsicValue / 1e9).toFixed(2)}B (Market Cap: $${(marketData.marketCap ? marketData.marketCap/1e9 : 0).toFixed(2)}B)
- **Margin of Safety:** ${(marginOfSafety * 100).toFixed(1)}%

**Key Findings:**
${moatAnalysis.details.slice(0, 3).map(d => `- ${d}`).join('\n')}
${consistencyAnalysis.details.slice(0, 2).map(d => `- ${d}`).join('\n')}
`;

  return {
    agentName: 'WarrenBuffett',
    analysis: analysisText,
    keyPoints: [
      `Signal: ${result.signal}`,
      `Moat Score: ${moatAnalysis.score}/5`,
      `Margin of Safety: ${(marginOfSafety * 100).toFixed(1)}%`
    ],
    score: (moatAnalysis.score + consistencyAnalysis.score) * 10, // Rough scoring 0-100
    timestamp: new Date(),
    signal: result.signal as any,
    confidence: result.confidence,
    moatScore: moatAnalysis.score,
    intrinsicValue: ivAnalysis.intrinsicValue,
    marginOfSafety: marginOfSafety
  };
}
