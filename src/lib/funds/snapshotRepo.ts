import { prisma } from "@/lib/prisma";

export type SnapshotPerfPoint = { date: string; fundPct: number; benchPct: number };

function startDateForRange(range: string): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (range === "1M") d.setUTCDate(d.getUTCDate() - 31);
  else if (range === "3M") d.setUTCDate(d.getUTCDate() - 93);
  else if (range === "YTD" || range === "1Y") d.setUTCMonth(0, 1);
  else d.setUTCDate(d.getUTCDate() - 3650); // ALL ~ 10y cap
  return d;
}

export async function getFundSnapshots(slug: string, range: string) {
  const fund = await (prisma as any).fund.findUnique({ where: { slug } });
  if (!fund) return { fund: null, points: [] as SnapshotPerfPoint[] };

  const start = startDateForRange(range);
  const rows = await (prisma as any).fundSnapshot.findMany({
    where: { fundId: fund.id, date: { gte: start } },
    orderBy: { date: "asc" },
    select: { date: true, equity: true, benchmark: true },
  });

  // Convert DB format to API format
  // DB stores: equity (index starting at 100), benchmark (index starting at 100)
  // API expects: fundPct (% change), benchPct (% change)
  const points: SnapshotPerfPoint[] = rows.map((r: any) => ({
    date: r.date.toISOString().slice(0, 10), // YYYY-MM-DD
    fundPct: r.equity - 100, // Convert 100-based index to percent change
    benchPct: (r.benchmark ?? 100) - 100,
  }));

  return { fund, points };
}

export async function hasEnoughSnapshots(points: SnapshotPerfPoint[], range: string) {
  // Heuristic: ensure we have enough data points to serve a meaningful series
  const min = range === "1M" ? 10 : range === "3M" ? 25 : range === "YTD" || range === "1Y" ? 60 : 120;
  return points.length >= min;
}
