/**
 * Sentiment Agent - Uses Claude (Anthropic) for market sentiment analysis
 * Analyzes news, insider trading, and market psychology
 */

import Anthropic from '@anthropic-ai/sdk';
import { MarketData, SentimentResult } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SENTIMENT_PROMPT = `You are an expert market sentiment analyst with deep expertise in behavioral finance and market psychology.

Your task is to analyze market sentiment around a stock by examining:
1. Recent news headlines and articles
2. Insider trading activity (buying vs selling by executives)
3. Market momentum and investor psychology
4. Social sentiment and retail investor interest
5. Institutional positioning and analyst sentiment

Provide a comprehensive sentiment analysis including:
- Overall sentiment (Bullish/Neutral/Bearish)
- Sentiment score (-100 to +100, where -100 is extremely bearish and +100 is extremely bullish)
- Key sentiment drivers (what's moving the stock?)
- Contrarian indicators (is the crowd too optimistic or pessimistic?)
- News impact assessment
- Insider confidence level

Be objective and identify both positive and negative sentiment signals.`;

export async function runSentimentAgent(
  marketData: MarketData
): Promise<SentimentResult> {
  const startTime = Date.now();

  try {
    // Build context from news and insider data
    let dataContext = `Stock: ${marketData.ticker}\nCurrent Price: $${marketData.currentPrice}\n\n`;

    if (marketData.recentNews && marketData.recentNews.length > 0) {
      dataContext += 'Recent News:\n';
      marketData.recentNews.forEach((news, idx) => {
        dataContext += `${idx + 1}. ${news.headline}\n   Summary: ${news.summary}\n   Source: ${news.source} | Sentiment: ${news.sentiment}\n\n`;
      });
    }

    if (marketData.insiderTransactions && marketData.insiderTransactions.length > 0) {
      dataContext += 'Insider Trading Activity:\n';
      marketData.insiderTransactions.forEach((txn, idx) => {
        dataContext += `${idx + 1}. ${txn.name} (${txn.position}): ${txn.transactionType} ${txn.shares.toLocaleString()} shares worth $${txn.value.toLocaleString()} on ${txn.date}\n`;
      });
    }

    if (!marketData.recentNews?.length && !marketData.insiderTransactions?.length) {
      dataContext += 'Note: Limited news and insider data available. Focus on general market sentiment and technical indicators.\n';
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${SENTIMENT_PROMPT}\n\nAnalyze the market sentiment for the following stock:\n\n${dataContext}`,
        },
      ],
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse sentiment from the analysis
    const sentimentMatch = analysis.match(/overall sentiment[:\s]+(Bullish|Neutral|Bearish)/i);
    const scoreMatch = analysis.match(/sentiment score[:\s]+(-?\d+)/i);

    const overallSentiment = sentimentMatch
      ? (sentimentMatch[1] as 'Bullish' | 'Neutral' | 'Bearish')
      : 'Neutral';
    const sentimentScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    // Extract key points
    const keyPoints = analysis
      .split('\n')
      .filter(line => line.match(/^[-•*\d.]/))
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5);

    return {
      agentName: 'Sentiment',
      analysis,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['See full analysis for sentiment drivers'],
      overallSentiment,
      sentimentScore,
      score: (sentimentScore + 100) / 2, // Convert to 0-100 scale
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Sentiment agent error:', error);
    throw new Error(`Sentiment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
