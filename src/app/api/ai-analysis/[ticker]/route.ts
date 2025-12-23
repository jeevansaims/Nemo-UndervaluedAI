/**
 * API Route: POST /api/ai-analysis/[ticker]
 * Handles AI-powered stock analysis requests with usage limits and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runStockAnalysis, validateApiKeys } from '@/lib/ai/orchestrator';
import { MarketData } from '@/lib/ai/types';

const FREE_ANALYSIS_LIMIT = 5; // Free users get 5 analyses per month

/**
 * Fetch market data for a ticker from Finnhub
 */
async function fetchMarketData(ticker: string): Promise<MarketData> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    // Fetch current quote
    const quoteRes = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
    );
    const quote = await quoteRes.json();

    // Fetch company profile (for market cap, etc.)
    const profileRes = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`
    );
    const profile = await profileRes.json();

    // Fetch basic financials
    const financialsRes = await fetch(
      `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${apiKey}`
    );
    const financials = await financialsRes.json();

    // Fetch recent news
    const newsRes = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${getDateDaysAgo(7)}&to=${getTodayDate()}&token=${apiKey}`
    );
    const news = await newsRes.json();

    // Fetch insider transactions
    const insiderRes = await fetch(
      `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${ticker}&token=${apiKey}`
    );
    const insiderData = await insiderRes.json();

    const marketData: MarketData = {
      ticker: ticker.toUpperCase(),
      currentPrice: quote.c || 0,
      marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1e6 : undefined,
      peRatio: financials.metric?.peBasicExclExtraTTM,
      pbRatio: financials.metric?.pbAnnual,
      debtToEquity: financials.metric?.totalDebt2TotalEquityAnnual,
      roe: financials.metric?.roeRfy,
      revenueGrowth: financials.metric?.revenueGrowthTTMYoy,
      earningsGrowth: financials.metric?.epsGrowthTTMYoy,
      freeCashFlow: financials.metric?.freeCashFlowTTM,
      dividendYield: financials.metric?.dividendYieldIndicatedAnnual,
      beta: financials.metric?.beta,
      recentNews: news.slice(0, 5).map((item: any) => ({
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        sentiment: item.sentiment || 'neutral',
        publishedAt: new Date(item.datetime * 1000).toISOString(),
      })),
      insiderTransactions: insiderData.data?.slice(0, 10).map((txn: any) => ({
        name: txn.name,
        position: txn.position || 'N/A',
        transactionType: txn.transactionCode,
        shares: txn.share,
        value: txn.value || 0,
        date: txn.transactionDate,
      })),
    };

    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error(`Failed to fetch market data for ${ticker}`);
  }
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate API keys
    try {
      validateApiKeys();
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'API keys not configured' },
        { status: 500 }
      );
    }

    const { ticker } = await params;
    const upperTicker = ticker.toUpperCase();

    // 3. Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Fetch market data
    const marketData = await fetchMarketData(upperTicker);

    // 5. Run AI analysis
    const result = await runStockAnalysis(marketData);

    // 6. Store analysis record with results
    const analysis = await prisma.stockAnalysis.create({
      data: {
        userId: user.id,
        ticker: upperTicker,
        status: 'COMPLETED',
        recommendation: result.portfolioManager.recommendation,
        targetPrice: result.portfolioManager.targetPrice ?? null,
        confidenceScore: result.portfolioManager.confidenceScore,
        valuationResult: result.valuation.analysis,
        sentimentResult: result.sentiment.analysis,
        fundamentalResult: result.fundamental.analysis,
        riskResult: result.risk.analysis,
        finalReport: result.portfolioManager.finalReport,
        currentPrice: marketData.currentPrice ?? null,
        marketCap: marketData.marketCap ?? null,
        peRatio: marketData.peRatio ?? null,
        processingTime: result.processingTime,
        agentResults: JSON.stringify(result),
      },
    });

    // 7. Return the analysis result
    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      result,
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-analysis/[ticker] - Get latest analysis for a ticker
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { ticker } = await params;

    const analysis = await prisma.stockAnalysis.findFirst({
      where: {
        userId: user.id,
        ticker: ticker.toUpperCase(),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('GET analysis error:', error);
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}
