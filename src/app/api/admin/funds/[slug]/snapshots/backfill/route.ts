import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { finnhubGet } from "@/lib/market/finnhub";
import { rangeToFromTo } from "@/lib/market/timeRange";
import { getFundHoldings, normalizeWeights } from "@/lib/funds/realHoldings";

type FinnhubCandles = {
  c: number[];
  s: "ok" | "no_data";
  t: number[];
};

function isoDateFromUnix(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function toUTCDateStart(dateStr: string) {
  const parts = dateStr.split("-");
  return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
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

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const days = Math.max(30, Math.min(3650, Number(url.searchParams.get("days") || "365")));

  const fund = await (prisma as any).fund.findUnique({ where: { slug } });
  if (!fund) return NextResponse.json({ error: "Fund not found" }, { status: 404 });

  try {
    // Compute live performance for the last N days
    const now = Math.floor(Date.now() / 1000);
    const from = now - (days * 86400);
    const to = now;

    const holdings = normalizeWeights(getFundHoldings(slug));
    const benchSymbol = "SPY";

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

    // Build date intersection
    const dateSets = closesByTicker.map((x) => new Set(x.series.map((p) => p.date)));
    if (bench.length) dateSets.push(new Set(bench.map((p) => p.date)));

    if (dateSets.length === 0) {
      return NextResponse.json({ error: "No data available" }, { status: 400 });
    }

    let common = dateSets[0];
    for (let i = 1; i < dateSets.length; i++) {
      const next = new Set<string>();
      for (const d of common) if (dateSets[i].has(d)) next.add(d);
      common = next;
    }

    const dates = Array.from(common).sort();

    if (dates.length < 5) {
      return NextResponse.json({ error: "Insufficient data points" }, { status: 400 });
    }

    // Map date->close
    const benchMap = new Map(bench.map((p) => [p.date, p.close]));
    const seriesMaps = closesByTicker.map((x) => ({
      weight: x.weight,
      map: new Map(x.series.map((p) => [p.date, p.close])),
    }));

    // Normalize to 100 at start
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

    // Create snapshots (equity stored as 100-based index)
    const upserts = dates.map((d, i) =>
      (prisma as any).fundSnapshot.upsert({
        where: { fundId_date: { fundId: fund.id, date: toUTCDateStart(d) } },
        create: {
          fundId: fund.id,
          date: toUTCDateStart(d),
          equity: portfolioLevels[i].level,
          benchmark: benchLevels[i].level,
          metrics: null,
        },
        update: {
          equity: portfolioLevels[i].level,
          benchmark: benchLevels[i].level,
        },
        select: { date: true },
      })
    );

    const results = await (prisma as any).$transaction(upserts);

    return NextResponse.json({
      ok: true,
      fund: slug,
      daysRequested: days,
      upserted: results.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Backfill failed", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
