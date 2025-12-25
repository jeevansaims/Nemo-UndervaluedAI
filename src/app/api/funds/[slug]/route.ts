/**
 * API Route: GET /api/funds/[slug]
 * Returns detailed fund information including holdings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const fund = await prisma.fund.findUnique({
      where: { slug },
    });
    
    if (!fund) {
      return NextResponse.json(
        { error: 'Fund not found' },
        { status: 404 }
      );
    }
    
    // Get holdings separately
    const holdings = await prisma.holding.findMany({
      where: { fundId: fund.id },
      orderBy: { weightPct: 'desc' },
    });
    
    // Get latest snapshot for current metrics
    const latestSnapshot = await prisma.fundSnapshot.findFirst({
      where: { fundId: fund.id },
      orderBy: { date: 'desc' },
    });
    
    return NextResponse.json({
      fund: {
        ...fund,
        holdings,
        currentValue: latestSnapshot?.equity || 100,
        metrics: latestSnapshot?.metrics || null,
        lastUpdated: latestSnapshot?.date || fund.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching fund:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fund' },
      { status: 500 }
    );
  }
}



