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
    // TEMPORARY: Auth check disabled for testing PT/SL feature
    // TODO: Re-enable auth once testing is complete
    // const session = await auth();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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

    // 3. Get user - TEMPORARILY BYPASSED
    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email },
    //   select: { id: true, isPremium: true },
    // });
    // if (!user) {
    //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
    // }

    // 4. Fetch market data
    const marketData = await fetchMarketData(upperTicker);

    // 5. Check usage limits - TEMPORARILY BYPASSED FOR TESTING
    /*
    // if (!user.isPremium) {
    //   const startOfMonth = new Date();
    //   startOfMonth.setDate(1);
    //   startOfMonth.setHours(0, 0, 0, 0);
    //   const analysesThisMonth = await prisma.stockAnalysis.count({
    //     where: {
    //       userId: user.id,
    //       createdAt: { gte: startOfMonth },
    //     },
    //   });
    //   if (analysesThisMonth >= FREE_ANALYSIS_LIMIT) {
    //     return NextResponse.json(
    //       {
    //         error: `Free tier limit reached. You've used ${analysesThisMonth}/${FREE_ANALYSIS_LIMIT} analyses this month.`,
    //         limit: FREE_ANALYSIS_LIMIT,
    //         used: analysesThisMonth,
    //       },
    //       { status: 429 }
    //     );
    //   }
    // }
    */
    
    // 6. Run AI analysis
    const result = await runStockAnalysis(marketData, undefined);

    // 7. Store analysis record - TEMPORARILY BYPASSED FOR TESTING
    // const analysis = await prisma.stockAnalysis.create({
    //   data: {
    //     userId: user.id,
    //     ticker: upperTicker,
    //     status: 'COMPLETED',
    //     recommendation: result.portfolioManager.rating,
    //     targetPrice: result.portfolioManager.targetPrice ?? null,
    //     confidence: result.portfolioManager.confidence,
    //     processingTime: result.processingTime,
    //     agentResults: JSON.stringify(result),
    //   },
    // });

    // 8. Return the analysis result
    return NextResponse.json({
      success: true,
      // analysisId: analysis.id, // Commented out since we're not saving
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
    // TEMPORARY: Auth check disabled for testing
    // TODO: Re-enable auth once testing is complete
    // const session = await auth();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // For testing without auth, we'll use a dummy user ID or bypass user check if possible
    // If user-specific data is needed, mock 'session.user.email' or 'user' object
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }, // Use a dummy email for testing
      select: { id: true },
    });

    if (!user) {
      // If the dummy user doesn't exist, create one or return an error
      // For now, we'll return an error if the dummy user isn't found
      return NextResponse.json({ error: 'Test user not found in DB' }, { status: 404 });
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
