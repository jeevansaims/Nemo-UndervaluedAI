import { NextResponse } from "next/server";
import { getServerRole } from "@/lib/auth/serverRole";
import { getPrivateFundData } from "@/lib/funds/privateFundData";
import { redactTrades } from "@/lib/funds/fundAccess";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const role = await getServerRole();
    const { trades } = getPrivateFundData(slug);

    const safe = redactTrades(trades, role);

    return NextResponse.json({
      slug,
      role,          // helpful during dev; remove later if you want
      trades: safe,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Trades fetch failed", detail: String(e?.message ?? e) },
      { status: 502 }
    );
  }
}
