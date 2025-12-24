/**
 * API Route: GET /api/funds/[slug]
 * Returns detailed fund information including holdings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock fund data for demo when database is unavailable
const MOCK_FUND = {
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
  holdings: [
    { id: '1', ticker: 'NVDA', name: 'NVIDIA Corporation', weightPct: 25.5, rationale: 'AI chip leader with dominant market position' },
    { id: '2', ticker: 'AMD', name: 'Advanced Micro Devices', weightPct: 18.2, rationale: 'Strong momentum in data center GPUs' },
    { id: '3', ticker: 'META', name: 'Meta Platforms', weightPct: 15.8, rationale: 'AI investments driving revenue growth' },
    { id: '4', ticker: 'MSFT', name: 'Microsoft Corporation', weightPct: 14.5, rationale: 'Azure + OpenAI partnership momentum' },
    { id: '5', ticker: 'NFLX', name: 'Netflix Inc', weightPct: 12.0, rationale: 'Strong revenue growth trajectory' },
  ],
  lastUpdated: new Date().toISOString(),
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const fund = await prisma.fund.findUnique({
      where: { slug },
      include: {
        holdings: {
          orderBy: { weightPct: 'desc' },
        },
      },
    });
    
    if (!fund) {
      // Return mock data if fund not found (for demo)
      if (slug === 'ai-growth-fund') {
        return NextResponse.json({ fund: MOCK_FUND });
      }
      return NextResponse.json(
        { error: 'Fund not found' },
        { status: 404 }
      );
    }
    
    // Get latest snapshot for current metrics
    const latestSnapshot = await prisma.fundSnapshot.findFirst({
      where: { fundId: fund.id },
      orderBy: { date: 'desc' },
    });
    
    return NextResponse.json({
      fund: {
        ...fund,
        currentValue: latestSnapshot?.equity || 100,
        metrics: latestSnapshot?.metrics || null,
        lastUpdated: latestSnapshot?.date || fund.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching fund, using mock data:', error);
    // Return mock data when database is unavailable
    return NextResponse.json({ fund: MOCK_FUND });
  }
}

