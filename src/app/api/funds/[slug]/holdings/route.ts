import { NextResponse } from "next/server";
import { getServerRole } from "@/lib/auth/serverRole";
import { getPrivateFundData } from "@/lib/funds/privateFundData";
import { redactHoldings } from "@/lib/funds/fundAccess";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const role = await getServerRole();
    const { holdings } = getPrivateFundData(slug);

    const safe = redactHoldings(holdings, role);

    return NextResponse.json({
      slug,
      role,          // helpful during dev; remove later if you want
      holdings: safe,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Holdings fetch failed", detail: String(e?.message ?? e) },
      { status: 502 }
    );
  }
}
