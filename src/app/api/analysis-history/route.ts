import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const ticker = searchParams.get("ticker");

    const where = ticker ? { ticker: ticker.toUpperCase() } : {};

    const analyses = await prisma.stockAnalysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        ticker: true,
        recommendation: true,
        targetPrice: true,
        confidence: true,
        valuationScore: true,
        riskScore: true,
        technicalScore: true,
        currentPrice: true,
        peRatio: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ analyses });
  } catch (error: any) {
    console.error("[API] Failed to fetch analysis history:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis history", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}
