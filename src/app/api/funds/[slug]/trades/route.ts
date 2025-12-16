import { NextResponse } from "next/server";
import { getServerRole } from "@/lib/auth/serverRole";
import { getPrivateFundData } from "@/lib/funds/privateFundData";
import { redactTrades, TradeRow } from "@/lib/funds/fundAccess";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const role = await getServerRole();
    
    // Try DB first
    let trades: TradeRow[] = [];
    const dbData = await (prisma as any).trade?.findMany({
        where: { fund: { slug } },
        orderBy: { date: 'desc' },
    });

    if (dbData && dbData.length > 0) {
        trades = dbData.map((t: any) => ({
            ts: Math.floor(new Date(t.date).getTime() / 1000),
            ticker: t.ticker,
            action: t.action as "BUY" | "SELL",
            qty: t.qty,
            price: t.price,
            rationale: t.rationale
        }));
    } else {
        // Fallback
        trades = getPrivateFundData(slug).trades;
    }

    const safe = redactTrades(trades, role);

    return NextResponse.json({
      slug,
      role,
      trades: safe,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Trades fetch failed", detail: String(e?.message ?? e) },
      { status: 502 }
    );
  }
}
