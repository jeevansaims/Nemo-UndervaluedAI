import type { RangeKey } from "@/lib/market/timeRange";

export type CandlePoint = { t: number; c: number; o: number; h: number; l: number; v: number };

export async function getCandles(params: {
  ticker: string;
  range: RangeKey;
  baseUrl?: string; // optional if you want absolute URLs in server components
}) {
  const { ticker, range, baseUrl } = params;
  const url = `${baseUrl ?? ""}/api/market/candles?ticker=${encodeURIComponent(ticker)}&range=${encodeURIComponent(range)}`;

  const res = await fetch(url, {
    // IMPORTANT: do not use no-store everywhere; let your route handler cache/revalidate
    // In Next.js Server Components, fetch is cached by default; your route handler also revalidates.
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Candles failed: ${res.status}`);
  const json = await res.json();

  return (json.points ?? []) as CandlePoint[];
}

export async function getQuote(params: { ticker: string; baseUrl?: string }) {
  const { ticker, baseUrl } = params;
  const url = `${baseUrl ?? ""}/api/market/quote?ticker=${encodeURIComponent(ticker)}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
  return res.json() as Promise<{ symbol: string; c: number; dp: number; t: number }>;
}
