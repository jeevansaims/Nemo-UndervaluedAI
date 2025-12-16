import { NextResponse } from "next/server";
import { finnhubGet } from "@/lib/market/finnhub";
import { FinnhubQuote, FinnhubQuoteSchema } from "@/lib/validators/finnhub";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ticker = (searchParams.get("ticker") || "").toUpperCase();

  if (!ticker) return NextResponse.json({ error: "No ticker" }, { status: 400 });

  try {
    const data = await finnhubGet<FinnhubQuote>("/quote", { symbol: ticker }, FinnhubQuoteSchema);
    return NextResponse.json({ symbol: ticker, ...data });
  } catch (e: any) {
    return NextResponse.json({ error: "Quote fetch failed", detail: String(e?.message ?? e) }, { status: 502 });
  }
}
