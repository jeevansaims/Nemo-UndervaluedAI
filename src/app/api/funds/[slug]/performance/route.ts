/**
 * API Route: GET /api/funds/[slug]/performance
 * Returns time series performance data for charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '1Y'; // 1M, 3M, 6M, 1Y, ALL
    
    const fund = await prisma.fund.findUnique({
      where: { slug },
      select: { id: true },
    });
    
    if (!fund) {
      return NextResponse.json(
        { error: 'Fund not found' },
        { status: 404 }
      );
    }
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = new Date(0); // Get all data
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }
    
    const snapshots = await prisma.fundSnapshot.findMany({
      where: {
        fundId: fund.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        equity: true,
      },
    });
    
    return NextResponse.json({
      performance: snapshots.map(s => ({
        date: s.date.toISOString(),
        value: s.equity,
      })),
      range,
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}
