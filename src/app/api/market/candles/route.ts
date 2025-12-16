import { NextResponse } from "next/server";
import { finnhubGet } from "@/lib/market/finnhub";
import { rangeToFromTo, rangeToResolution, type RangeKey } from "@/lib/market/timeRange";

type FinnhubCandles = {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: "ok" | "no_data";
  t: number[]; // unix seconds
  v: number[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("ticker") || searchParams.get("symbol") || "").toUpperCase();
  const range = (searchParams.get("range") || "1Y") as RangeKey;
  if (!symbol) return NextResponse.json({ error: "Missing ticker" }, { status: 400 });

  const { from, to } = rangeToFromTo(range);
  const resolution = rangeToResolution(range);

  try {
    const data = await finnhubGet<FinnhubCandles>("/stock/candle", {
      symbol,
      resolution,
      from,
      to,
    });

    if (data.s !== "ok" || !data.t?.length) {
      return NextResponse.json({ symbol, range, resolution, points: [] });
    }

    const points = data.t.map((ts, i) => ({
      t: ts,
      c: data.c[i],
      o: data.o[i],
      h: data.h[i],
      l: data.l[i],
      v: data.v[i],
    }));

    return NextResponse.json({ symbol, range, resolution, points });
  } catch (e: any) {
    return NextResponse.json({ error: "Candles fetch failed", detail: String(e?.message ?? e) }, { status: 502 });
  }
}
