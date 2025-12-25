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

    // Fetch basic financials (current metrics)
    const financialsRes = await fetch(
      `https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${apiKey}`
    );
    const financials = await financialsRes.json();

    // Fetch HISTORICAL financial statements (for Warren Buffett analysis)
    // This endpoint provides multi-year income statement/balance sheet data
    const statementsRes = await fetch(
      `https://finnhub.io/api/v1/stock/financials-reported?symbol=${ticker}&token=${apiKey}`
    );
    const statementsData = await statementsRes.json();

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

    // Parse FINANCIAL STATEMENTS data (from financials-reported endpoint)
    // This gives us multi-year historical data for moat/intrinsic value calculations
    const financialHistory: any[] = [];
    
    if (statementsData.data && Array.isArray(statementsData.data)) {
      // Group reports by fiscal year
      const annualReports = statementsData.data.filter((r: any) => r.form === '10-K');
      
      for (const report of annualReports.slice(0, 5)) { // Last 5 years
        const filingDate = report.filedDate || report.acceptedDate;
        const fiscalYear = report.year;
        
        // Extract key metrics from the report
        const ic = report.report?.ic || []; // Income statement items
        const bs = report.report?.bs || []; // Balance sheet items
        const cf = report.report?.cf || []; // Cash flow items
        
        // Helper to find concept value
        const findValue = (items: any[], concepts: string[]) => {
          for (const concept of concepts) {
            const item = items.find((i: any) => 
              i.concept?.toLowerCase().includes(concept.toLowerCase())
            );
            if (item?.value) return item.value;
          }
          return undefined;
        };
        
        const revenue = findValue(ic, ['revenue', 'salesrevenuenet', 'revenues']);
        const netIncome = findValue(ic, ['netincome', 'profitloss', 'netincomeloss']);
        const eps = findValue(ic, ['earningspersharebasic', 'epsdiluted']);
        const fcf = findValue(cf, ['netcashprovidedbyoperatingactivities', 'freecashflow']);
        const grossProfit = findValue(ic, ['grossprofit']);
        const operatingIncome = findValue(ic, ['operatingincome', 'operatingincomeloss']);
        const totalAssets = findValue(bs, ['assets', 'totalassets']);
        const totalEquity = findValue(bs, ['stockholdersequity', 'totalequity']);
        const totalDebt = findValue(bs, ['longtermdebt', 'totaldebt']);
        
        // Calculate derived metrics
        const grossMargin = revenue && grossProfit ? grossProfit / revenue : undefined;
        const operatingMargin = revenue && operatingIncome ? operatingIncome / revenue : undefined;
        const roe = totalEquity && netIncome ? netIncome / totalEquity : undefined;
        const debtToEquity = totalEquity && totalDebt ? totalDebt / totalEquity : undefined;
        
        if (revenue || netIncome) {
          financialHistory.push({
            date: filingDate || `${fiscalYear}-12-31`,
            revenue,
            netIncome,
            eps,
            freeCashFlow: fcf,
            grossMargin,
            operatingMargin,
            roe,
            debtToEquity,
          });
        }
      }
    }
    
    // Fallback: If no statements data, try to create basic history from current metrics
    if (financialHistory.length === 0 && financials.metric) {
      // Create a single period from current metrics
      const currentMetrics = {
        date: new Date().toISOString().split('T')[0],
        roe: financials.metric.roeRfy,
        grossMargin: financials.metric.grossMarginTTM / 100,
        operatingMargin: financials.metric.operatingMarginTTM / 100,
        debtToEquity: financials.metric.totalDebt2TotalEquityAnnual,
      };
      if (currentMetrics.roe || currentMetrics.grossMargin) {
        financialHistory.push(currentMetrics);
      }
    }

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
      financialHistory, // Add the historical data
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

    const { ticker: tickerParam } = await params;
    const upperTicker = tickerParam.toUpperCase();

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

    // 5. Get last analysis for consistency (within last 24 hours)
    const lastAnalysis = await prisma.stockAnalysis.findFirst({
      where: {
        userId: user.id,
        ticker: upperTicker,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        targetPrice: true,
        createdAt: true,
      },
    });

    // 6. Run AI analysis with last target price for consistency
    const result = await runStockAnalysis(
      marketData,
      lastAnalysis?.targetPrice ?? undefined
    );

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
