import { NextResponse } from "next/server";
import { finnhubGet } from "@/lib/market/finnhub";
import { rangeToFromTo, type RangeKey } from "@/lib/market/timeRange";
import { getFundHoldings, normalizeWeights } from "@/lib/funds/realHoldings";
import { getFundSnapshots, hasEnoughSnapshots } from "@/lib/funds/snapshotRepo";

type FinnhubCandles = {
  c: number[];
  s: "ok" | "no_data";
  t: number[];
};

type PerfPoint = {
  date: string;      // YYYY-MM-DD
  fundPct: number;   // percent points, e.g. 12.3
  benchPct: number;  // percent points
};

function isoDateFromUnix(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

async function fetchDailyCloses(symbol: string, from: number, to: number) {
  const data = await finnhubGet<FinnhubCandles>("/stock/candle", {
    symbol,
    resolution: "D",
    from,
    to,
  });
  if (data.s !== "ok" || !data.t?.length) return [];
  return data.t.map((t, i) => ({ date: isoDateFromUnix(t), close: data.c[i] }));
}

// Extracted live computation logic for fallback
async function computeLivePerformance(slug: string, range: RangeKey, benchSymbol: string) {
  const { from, to } = rangeToFromTo(range);

  const holdings = normalizeWeights(getFundHoldings(slug));

  // Fetch benchmark
  const bench = await fetchDailyCloses(benchSymbol, from, to);

  // Fetch holdings closes
  const closesByTicker = await Promise.all(
    holdings.map(async (h) => ({
      ticker: h.ticker,
      weight: h.weight,
      series: await fetchDailyCloses(h.ticker, from, to),
    }))
  );

  // Build date intersection (only dates present for all)
  const dateSets = closesByTicker.map((x) => new Set(x.series.map((p) => p.date)));
  if (bench.length) dateSets.push(new Set(bench.map((p) => p.date)));

  if (dateSets.length === 0) {
    return [];
  }

  let common = dateSets[0];
  for (let i = 1; i < dateSets.length; i++) {
    const next = new Set<string>();
    for (const d of common) if (dateSets[i].has(d)) next.add(d);
    common = next;
  }

  const dates = Array.from(common).sort();

  if (dates.length < 5) {
    return [];
  }

  // Map date->close
  const benchMap = new Map(bench.map((p) => [p.date, p.close]));
  const seriesMaps = closesByTicker.map((x) => ({
    weight: x.weight,
    map: new Map(x.series.map((p) => [p.date, p.close])),
  }));

  // Normalize each component to 100 at start and compute weighted portfolio level
  const startDate = dates[0];
  const bench0 = benchMap.get(startDate) ?? 1;

  const basePerTicker = seriesMaps.map((s) => s.map.get(startDate)!);

  const portfolioLevels = dates.map((d) => {
    let level = 0;
    for (let i = 0; i < seriesMaps.length; i++) {
      const close = seriesMaps[i].map.get(d)!;
      const base = basePerTicker[i];
      level += seriesMaps[i].weight * (100 * (close / base));
    }
    return { date: d, level };
  });

  const benchLevels = dates.map((d) => ({
    date: d,
    level: 100 * ((benchMap.get(d) ?? bench0) / bench0),
  }));

  const fund0 = portfolioLevels[0].level;

  const points: PerfPoint[] = dates.map((d, i) => {
    const fundLevel = portfolioLevels[i].level;
    const benchLevel = benchLevels[i].level;
    return {
      date: d,
      fundPct: ((fundLevel / fund0) - 1) * 100,
      benchPct: ((benchLevel / 100) - 1) * 100,
    };
  });

  return points;
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "1Y") as RangeKey;
  const benchSymbol = (searchParams.get("benchmark") || "SPY").toUpperCase();

  try {
    // 1) Try DB-first (fast path)
    const { points: dbPoints } = await getFundSnapshots(slug, range);

    if (await hasEnoughSnapshots(dbPoints, range)) {
      return NextResponse.json({ 
        slug, 
        range, 
        benchmark: benchSymbol, 
        source: "db",
        points: dbPoints 
      });
    }

    // 2) Fallback to live computation
    const livePoints = await computeLivePerformance(slug, range, benchSymbol);

    return NextResponse.json({ 
      slug, 
      range, 
      benchmark: benchSymbol, 
      source: "live",
      points: livePoints 
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Fund performance failed", detail: String(e?.message ?? e) }, { status: 502 });
  }
}
