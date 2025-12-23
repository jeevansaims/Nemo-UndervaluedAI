import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: 'Search query required' },
        { status: 400 }
      );
    }

    let dbResults: any[] = [];

    // Try to search in database first (if table exists)
    try {
      dbResults = await prisma.stock.findMany({
        where: {
          OR: [
            { ticker: { contains: query.toUpperCase(), mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          ticker: true,
          companyName: true,
          sector: true,
          currentPrice: true,
          marketCap: true,
        },
      });
    } catch (dbError) {
      // Table doesn't exist yet - will fall back to Finnhub
      console.log('Stock table not found, using Finnhub API fallback');
    }

    // If no results in DB, fallback to Finnhub API
    if (dbResults.length === 0) {
      try {
        const apiKey = process.env.FINNHUB_API_KEY;
        if (!apiKey) {
          console.warn('Finnhub API key not configured, cannot fetch external results');
          return NextResponse.json({
            results: [],
            count: 0,
            query,
          });
        }

        const response = await fetch(
          `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`
        );

        if (response.ok) {
          const data = await response.json();

          const apiResults = (data.result || [])
            .filter((item: any) => item.type === 'Common Stock')
            .slice(0, 10)
            .map((item: any) => ({
              ticker: item.symbol,
              companyName: item.description,
              displaySymbol: item.displaySymbol,
              sector: null,
              currentPrice: null,
              marketCap: null,
            }));

          return NextResponse.json({
            results: apiResults,
            count: apiResults.length,
            query,
            source: 'finnhub',
          });
        }
      } catch (error) {
        console.error('Error fetching from Finnhub:', error);
      }
    }

    return NextResponse.json({
      results: dbResults,
      count: dbResults.length,
      query,
      source: 'database',
    });
  } catch (error) {
    console.error('Stock search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
