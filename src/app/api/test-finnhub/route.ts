import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const token = (process.env.FINNHUB_API_KEY || "").trim();

  // Test direct Finnhub call with header
  const res = await fetch("https://finnhub.io/api/v1/quote?symbol=AAPL", {
    headers: {
      "X-Finnhub-Token": token,
    },
    cache: "no-store",
  });

  const text = await res.text();

  return NextResponse.json({
    tokenLength: token.length,
    tokenMasked: token.length >= 8 ? `${token.slice(0, 4)}…${token.slice(-4)}` : "",
    finnhubStatus: res.status,
    finnhubStatusText: res.statusText,
    finnhubBody: text.slice(0, 500),
  });
}
