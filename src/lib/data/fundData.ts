import type { RangeKey } from "@/lib/market/timeRange";

export type PerfPoint = {
  date: string;
  fundPct: number;
  benchPct: number;
  fundValue?: number;
  benchValue?: number;
};

export async function getFundPerformance(params: {
  slug: string;
  range: RangeKey;
  benchmark?: string;
  baseUrl?: string;
}): Promise<PerfPoint[]> {
  const { slug, range, benchmark, baseUrl } = params;

  const qs = new URLSearchParams();
  qs.set("range", range);
  if (benchmark) qs.set("benchmark", benchmark);

  const url = `${baseUrl ?? ""}/api/funds/${encodeURIComponent(slug)}/performance?${qs.toString()}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Fund perf failed: ${res.status}`);

  const json = await res.json();
  const points = (json.points ?? []) as PerfPoint[];

  // Defensive: ensure sorted + numeric
  return points
    .filter((p) => p?.date && Number.isFinite(p.fundPct) && Number.isFinite(p.benchPct))
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
