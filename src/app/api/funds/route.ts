/**
 * API Route: GET /api/funds
 * Returns list of all funds with basic info and latest metrics
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock data for demo when database is unavailable
const MOCK_FUNDS = [
  {
    id: 'ai-growth-fund',
    slug: 'ai-growth-fund',
    name: 'AI Growth Fund',
    description: 'AI-powered growth investing focused on high-conviction technology and innovation plays',
    currentValue: 127680,
    metrics: {
      totalReturn: 27.68,
      sharpeRatio: 1.95,
      maxDrawdown: -5.37,
      volatility: 10.37,
    },
    holdingsCount: 5,
    lastUpdated: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // Try to fetch from database
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
    
    return NextResponse.json({ funds: fundsWithMetrics.length > 0 ? fundsWithMetrics : MOCK_FUNDS });
  } catch (error) {
    console.error('Error fetching funds, using mock data:', error);
    // Return mock data when database is unavailable
    return NextResponse.json({ funds: MOCK_FUNDS });
  }
}
