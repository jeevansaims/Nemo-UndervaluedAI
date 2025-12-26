/**
 * Peter Lynch Agent - Find Ten-Baggers in Everyday Businesses
 * Focuses on PEG ratio, understandable businesses, growth at reasonable price.
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData } from '../types';
import { parseAgentResponse } from './parse-helper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PeterLynchResult {
  agentName: string;
  analysis: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  pegRatio: number;
}

export async function runPeterLynchAgent(marketData: MarketData): Promise<PeterLynchResult> {
  const peRatio = marketData.peRatio || 0;
  const earningsGrowth = marketData.earningsGrowth || 0;
  
  // PEG Ratio (P/E divided by earnings growth rate)
  const pegRatio = earningsGrowth > 0 ? peRatio / earningsGrowth : 999;
  
  const pegAssessment = pegRatio < 1 ? 'Undervalued (Ten-bagger potential!)' : 
                        pegRatio < 1.5 ? 'Fairly Valued' : 
                        pegRatio < 2 ? 'Somewhat Expensive' : 'Overvalued';

  const quantSummary = `
PETER LYNCH ANALYSIS:
- P/E Ratio: ${peRatio.toFixed(2)}
- Earnings Growth: ${earningsGrowth.toFixed(1)}%
- PEG Ratio: ${pegRatio.toFixed(2)} (${pegAssessment})
`;

  const prompt = `You are Peter Lynch, legendary fund manager of Fidelity Magellan Fund.

Analyze ${marketData.ticker} using your "invest in what you know" philosophy:

**Your Investment Philosophy:**
1. Invest in what you understand - can you explain this business in 2 minutes?
2. PEG ratio is king - PEG < 1 = potential ten-bagger
3. Look for "boring" companies in unglamorous industries
4. The best stocks are in companies everyone ignores
5. Do your homework - know WHY you own every stock
6. Fast growers (20-50% growth) are ideal, but stalwarts (10-20%) are safer

**QUANTITATIVE DATA:**
${quantSummary}

**PROVIDE A DETAILED ANALYSIS INCLUDING:**
1. **Stock Category**: Is this a Slow Grower, Stalwart, Fast Grower, Cyclical, Turnaround, or Asset Play?
2. **PEG Ratio Analysis**: At ${pegRatio.toFixed(2)}, is this a bargain or overpriced relative to growth?
3. **The Story**: What's the simple story here? Can a 10-year-old understand why this company will grow?
4. **Ten-Bagger Potential**: Does this have multi-year growth runway, or is it already priced for perfection?

**SIGNAL RULES:**
- BULLISH: PEG < 1.0, strong growth story, under-followed = Ten-bagger potential
- BEARISH: PEG > 2.0, declining growth, no clear story = Avoid
- NEUTRAL: Average PEG, mainstream stock, limited upside = Hold or wait

CRITICAL: Your response MUST be thorough and detailed (minimum 300 words). This is for institutional investors.

Return JSON with this EXACT structure:
{
  \"signal\": \"Bullish\" | \"Bearish\" | \"Neutral\",
  \"confidence\": 0-100,
  \"reasoning\": \"WRITE AT LEAST 300 WORDS in 3-4 detailed paragraphs:

Paragraph 1: PEG Ratio Analysis - Deep dive into the PEG ratio (${pegRatio.toFixed(2)}). At P/E ${peRatio.toFixed(2)} and growth rate ${(earningsGrowth).toFixed(1)}%, is this a fair price for growth? Explain what this PEG tells us.

Paragraph 2: Growth Story - Analyze the growth narrative. Earnings growth, market expansion potential. Is this a fast grower, stalwart, or slow grower? Does the story make sense?

Paragraph 3: Category Analysis - What type of stock is this (fast grower, stalwart, turnaround, asset play, cyclical)? Does it fit your 'invest in what you know' philosophy? What's the earnings power?

Paragraph 4: Investment Decision - Would you put this in your portfolio? At what price would it become a 10-bagger candidate? Be specific with numbers and your classic storytelling style.

Use Peter Lynch's accessible, story-driven style. Quote specific metrics and make it practical.\"\n}
`;

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    temperature: 0.1,
    messages: [{ role: 'user', content: `Ticker: ${marketData.ticker}\n\n${prompt}` }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const result = parseAgentResponse(responseText, 'PeterLynch');

  return {
    agentName: 'PeterLynch',
    analysis: `### Peter Lynch Analysis\n**Signal: ${result.signal}** (${result.confidence}%)\n\n${result.reasoning}\n\n**PEG Ratio:** ${pegRatio.toFixed(2)} (${pegAssessment})`,
    signal: result.signal as any,
    confidence: result.confidence,
    pegRatio: pegRatio
  };
}
