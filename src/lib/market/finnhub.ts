type FinnhubError = { status: number; message: string };

export function getFinnhubKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");
  return key;
}

export function cacheSeconds(): number {
  const n = Number(process.env.MARKET_CACHE_SECONDS ?? "60");
  return Number.isFinite(n) && n > 0 ? n : 60;
}

export async function finnhubGet<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const key = getFinnhubKey();
  const url = new URL(`https://finnhub.io/api/v1${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("token", key); 

  const res = await fetch(url.toString(), {
    // Next.js server fetch cache:
    next: { revalidate: cacheSeconds() },
  });

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    const err: FinnhubError = { status: res.status, message: body || res.statusText };
    throw new Error(JSON.stringify(err));
  }

  return res.json() as Promise<T>;
}
