import { NextResponse } from "next/server";
import { finnhubGet } from "@/lib/market/finnhub";
import { rangeToFromTo, rangeToResolution, type RangeKey } from "@/lib/market/timeRange";
import { FinnhubCandles, FinnhubCandlesSchema } from "@/lib/validators/finnhub";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ticker = (searchParams.get("ticker") || "").toUpperCase();
  const range = (searchParams.get("range") || "1Y") as RangeKey;

  if (!ticker) return NextResponse.json({ error: "No ticker" }, { status: 400 });

  const { from, to } = rangeToFromTo(range);
  const resolution = rangeToResolution(range);

  try {
    const data = await finnhubGet<FinnhubCandles>(
      "/stock/candle",
      { symbol: ticker, resolution, from, to },
      FinnhubCandlesSchema
    );

    if (data.s !== "ok" || !data.c || !data.t) {
      return NextResponse.json({ symbol: ticker, range, resolution, points: [] });
    }

    const points = data.t.map((ts, i) => ({
      t: ts,
      c: data.c[i],
      o: data.o?.[i] ?? data.c[i],
      h: data.h?.[i] ?? data.c[i],
      l: data.l?.[i] ?? data.c[i],
      v: data.v?.[i] ?? 0,
    }));

    return NextResponse.json({ symbol: ticker, range, resolution, points });
  } catch (e: any) {
    return NextResponse.json({ error: "Candles fetch failed", detail: String(e?.message ?? e) }, { status: 502 });
  }
}
