import { NextResponse } from "next/server";
import { finnhubGet } from "@/lib/market/finnhub";

type FinnhubQuote = {
  c: number; // current
  d: number; // change
  dp: number; // percent change
  h: number;
  l: number;
  o: number;
  pc: number; // prev close
  t: number; // unix
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("ticker") || searchParams.get("symbol") || "").toUpperCase();
  if (!symbol) return NextResponse.json({ error: "Missing ticker" }, { status: 400 });

  try {
    const q = await finnhubGet<FinnhubQuote>("/quote", { symbol });
    // If Finnhub returns all zeros (invalid/unknown ticker sometimes behaves like this or just works), pass it through
    return NextResponse.json({ symbol, ...q });
  } catch (e: any) {
    return NextResponse.json({ error: "Quote fetch failed", detail: String(e?.message ?? e) }, { status: 502 });
  }
}
