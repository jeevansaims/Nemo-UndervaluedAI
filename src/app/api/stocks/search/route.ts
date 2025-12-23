import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as yfinance from 'yfinance';

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

      // Search in database first
      const dbResults = await prisma.stock.findMany({
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

      // If no results, try fetching from yfinance
      if (dbResults.length === 0) {
              try {
                        const ticker = query.toUpperCase();
                        // This would call yfinance or your data provider
                // For now, returning empty suggestion
              } catch (error) {
                        console.error('Error fetching from yfinance:', error);
              }
      }

      return NextResponse.json({
              results: dbResults,
              count: dbResults.length,
      });
    } catch (error) {
          console.error('Stock search error:', error);
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
                );
    }
}
