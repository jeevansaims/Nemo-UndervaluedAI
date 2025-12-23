import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fund Performance API - Get historical performance data for AI funds

export async function GET(
    request: NextRequest,
  { params }: { params: { slug: string } }
  ) {
    try {
          const slug = params.slug;
          const searchParams = request.nextUrl.searchParams;
          const startDate = searchParams.get('startDate');
          const endDate = searchParams.get('endDate');
          const limit = searchParams.get('limit') || '100';

      // Find fund
      const fund = await prisma.aIFund.findUnique({
              where: { slug },
      });

      if (!fund) {
              return NextResponse.json(
                { error: 'Fund not found' },
                { status: 404 }
                      );
      }

      // Get performance data
      const performance = await prisma.aIFundPerformance.findMany({
              where: {
                        fundId: fund.id,
                        ...(startDate && { date: { gte: new Date(startDate) } }),
                        ...(endDate && { date: { lte: new Date(endDate) } }),
              },
              orderBy: { date: 'asc' },
              take: parseInt(limit),
      });

      // Calculate metrics
      const returns = performance.map((p) => p.return);
          const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
          const maxValue = Math.max(...performance.map((p) => p.value));
          const minValue = Math.min(...performance.map((p) => p.value));

      return NextResponse.json({
              fund: {
                        id: fund.id,
                        name: fund.name,
                        slug: fund.slug,
                        currentValue: fund.currentValue,
              },
              performance,
              metrics: {
                        averageReturn: avgReturn,
                        maxValue,
                        minValue,
                        dataPoints: performance.length,
              },
      });
    } catch (error) {
          console.error('Fund performance retrieval error:', error);
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
                );
    }
}
