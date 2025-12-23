import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Multi-Agent Stock Analysis
// Integrates with hedge fund agents (Valuation, Sentiment, Fundamental, Risk, Portfolio Manager)

export async function POST(
    request: NextRequest,
  { params }: { params: { ticker: string } }
  ) {
    try {
          const ticker = params.ticker.toUpperCase();

      // Check if stock exists
      let stock = await prisma.stock.findUnique({
              where: { ticker },
      });

      if (!stock) {
              return NextResponse.json(
                { error: 'Stock not found' },
                { status: 404 }
                      );
      }

      // Check for existing analysis
      const existingAnalysis = await prisma.stockAnalysis.findFirst({
              where: {
                        ticker,
                        status: 'COMPLETED',
              },
              orderBy: { createdAt: 'desc' },
      });

      // Return cached if recent (less than 24 hours)
      if (existingAnalysis && 
                  new Date().getTime() - existingAnalysis.updatedAt.getTime() < 24 * 60 * 60 * 1000) {
              return NextResponse.json({
                        cached: true,
                        analysis: existingAnalysis,
              });
      }

      // Create new analysis record
      const analysis = await prisma.stockAnalysis.create({
              data: {
                        ticker,
                        userId: 'system', // System-wide analysis
                        status: 'PROCESSING',
              },
      });

      // TODO: Call your hedge fund agents here
      // 1. Valuation Agent (Damodaran method)
      // 2. Sentiment Agent (news/social)
      // 3. Fundamental Agent (financials)
      // 4. Risk Agent (volatility/downside)
      // 5. Portfolio Manager Agent (allocation)

      // For now, return placeholder response
      return NextResponse.json({
              analysisId: analysis.id,
              ticker,
              status: 'PROCESSING',
              message: 'Analysis in progress. Agents are analyzing the stock...',
      });
    } catch (error) {
          console.error('Stock analysis error:', error);
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
                );
    }
}

export async function GET(
    request: NextRequest,
  { params }: { params: { ticker: string } }
  ) {
    try {
          const ticker = params.ticker.toUpperCase();

      // Get latest analysis
      const analysis = await prisma.stockAnalysis.findFirst({
              where: { ticker },
              orderBy: { createdAt: 'desc' },
      });

      if (!analysis) {
              return NextResponse.json(
                { error: 'No analysis found for this stock' },
                { status: 404 }
                      );
      }

      return NextResponse.json(analysis);
    } catch (error) {
          console.error('Stock analysis retrieval error:', error);
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
                );
    }
}
