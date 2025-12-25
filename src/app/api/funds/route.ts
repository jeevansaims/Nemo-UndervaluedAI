/**
 * API Route: GET /api/funds
 * Returns list of all funds with basic info and latest metrics
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all funds from database
    const funds = await prisma.fund.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        updatedAt: true,
      },
    });
    
    // Get latest snapshot for each fund to show current metrics
    const fundsWithMetrics = await Promise.all(
      funds.map(async (fund) => {
        const latestSnapshot = await prisma.fundSnapshot.findFirst({
          where: { fundId: fund.id },
          orderBy: { date: 'desc' },
          select: {
            date: true,
            equity: true,
            metrics: true,
          },
        });
        
        const holdingsCount = await prisma.holding.count({
          where: { fundId: fund.id },
        });
        
        return {
          ...fund,
          currentValue: latestSnapshot?.equity || 100,
          metrics: latestSnapshot?.metrics || null,
          holdingsCount,
          lastUpdated: latestSnapshot?.date || fund.updatedAt,
        };
      })
    );
    
    // Filter to only show funds with snapshots (active funds)
    const activeFunds = fundsWithMetrics.filter(f => f.metrics !== null);
    
    return NextResponse.json({ funds: activeFunds });
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funds' },
      { status: 500 }
    );
  }
}

