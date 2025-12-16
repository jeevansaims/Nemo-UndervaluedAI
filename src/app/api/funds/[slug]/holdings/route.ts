import { NextResponse } from "next/server";
import { getServerRole } from "@/lib/auth/serverRole";
import { getPrivateFundData } from "@/lib/funds/privateFundData";
import { redactHoldings, HoldingRow } from "@/lib/funds/fundAccess";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const role = await getServerRole();
    
    // Try DB first
    let holdings: HoldingRow[] = [];
    // We cast to any if types are missing to avoid build block until migration
    const dbData = await (prisma as any).holding?.findMany({
        where: { fund: { slug } },
        orderBy: { weightPct: 'desc' },
    });

    if (dbData && dbData.length > 0) {
        holdings = dbData.map((h: any) => ({
            ticker: h.ticker,
            name: h.name || undefined,
            weightPct: h.weightPct,
            bucket: h.bucket || undefined,
            rationale: h.rationale
        }));
    } else {
        // Fallback to mock
        holdings = getPrivateFundData(slug).holdings;
    }

    const safe = redactHoldings(holdings, role);

    return NextResponse.json({
      slug,
      role,
      holdings: safe,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Holdings fetch failed", detail: String(e?.message ?? e) },
      { status: 502 }
    );
  }
}
