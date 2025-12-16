import { NextResponse } from "next/server";
import { finnhubGet } from "@/lib/market/finnhub";
import { rangeToFromTo, rangeToResolution, type RangeKey } from "@/lib/market/timeRange";
import { computeRiskFromCloses } from "@/lib/analysis/riskFromCandles";
import {
  FinnhubProfile2Schema,
  FinnhubQuoteSchema,
  FinnhubCandlesSchema,
  FinnhubBasicFinancialsSchema,
  type FinnhubProfile2,
  type FinnhubQuote,
  type FinnhubCandles,
  type FinnhubBasicFinancials
} from "@/lib/validators/finnhub";

function isoDateFromUnix(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

export async function GET(req: Request, ctx: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await ctx.params;
  const ticker = (rawTicker || "").toUpperCase().trim();
  if (!ticker) return NextResponse.json({ error: "Missing ticker" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "1Y") as RangeKey;

  const { from, to } = rangeToFromTo(range);
  const resolution = rangeToResolution(range);

  try {
    const start = Date.now();
    
    // Run in parallel for speed
    const [profile, quote, candles, financials] = await Promise.all([
      finnhubGet<FinnhubProfile2>("/stock/profile2", { symbol: ticker }, FinnhubProfile2Schema),
      finnhubGet<FinnhubQuote>("/quote", { symbol: ticker }, FinnhubQuoteSchema),
      finnhubGet<FinnhubCandles>("/stock/candle", { symbol: ticker, resolution, from, to }, FinnhubCandlesSchema),
      finnhubGet<FinnhubBasicFinancials>("/stock/metric", { symbol: ticker, metric: "all" }, FinnhubBasicFinancialsSchema),
    ]);
    
    // Observability (Phase 8D-4)
    console.log(`[API] Analysis ${ticker} ${range} took ${Date.now() - start}ms`);

    const points =
      candles.s === "ok" && candles.t?.length
        ? candles.t.map((ts, i) => ({
            date: isoDateFromUnix(ts),
            close: candles.c[i],
          }))
        : [];

    const risk = points.length >= 10 ? computeRiskFromCloses({ closes: points }) : null;

    // Pick a small set of “headline” fundamentals commonly shown on sites like Undervalued
    const m = financials.metric ?? {};
    const headline = {
      peTTM: m["peTTM"] ?? null,
      pb: m["pb"] ?? null,
      psTTM: m["psTTM"] ?? null,
      epsTTM: m["epsTTM"] ?? null,
      roeTTM: m["roeTTM"] ?? null,
      netMarginTTM: m["netMarginTTM"] ?? null,
      operatingMarginTTM: m["operatingMarginTTM"] ?? null,
      "52WeekHigh": m["52WeekHigh"] ?? null,
      "52WeekLow": m["52WeekLow"] ?? null,
      "52WeekPriceReturnDaily": m["52WeekPriceReturnDaily"] ?? null,
    };

    return NextResponse.json({
      ticker,
      range,
      profile: {
        name: profile.name ?? ticker,
        ticker: profile.ticker ?? ticker,
        exchange: profile.exchange ?? null,
        industry: profile.finnhubIndustry ?? null,
        country: profile.country ?? null,
        currency: profile.currency ?? null,
        marketCap: profile.marketCapitalization ?? null,
        logo: profile.logo ?? null,
        weburl: profile.weburl ?? null,
        ipo: profile.ipo ?? null,
      },
      quote: {
        price: quote.c,
        change: quote.d,
        changePct: quote.dp,
        dayHigh: quote.h,
        dayLow: quote.l,
        open: quote.o,
        prevClose: quote.pc,
        asOf: quote.t,
      },
      priceSeries: points,        // [{date, close}]
      fundamentals: headline,     // selected metrics
      risk,                       // computed from your metrics engine
    });
  } catch (e: any) {
    // Keep it resilient: return minimal error + allow page to show an “unavailable” state
    return NextResponse.json(
      { error: "Analysis fetch failed", ticker, detail: String(e?.message ?? e) },
      { status: 502 }
    );
  }
}
