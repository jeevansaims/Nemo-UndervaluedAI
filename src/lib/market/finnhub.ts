

import { resilientFetch } from "@/lib/api/resilientFetch";

const MARKET_CACHE_SECONDS = Number(process.env.MARKET_CACHE_SECONDS || 60);

export class FinnhubError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "FinnhubError";
  }
}

export async function finnhubGet<T>(
  path: string,
  params: Record<string, string | number>,
  parser?: { parse: (data: unknown) => T } // Optional Zod schema
): Promise<T> {
  // Trim the key to remove any whitespace/newlines
  const token = (process.env.FINNHUB_API_KEY || "").trim();
  
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  );

  const url = `https://finnhub.io/api/v1${path}?${query.toString()}`;

  // Wrap in resilience layer
  const cacheKey = `finnhub:${path}:${JSON.stringify(params)}`;

  const { data } = await resilientFetch<T>(
    cacheKey,
    async () => {
      if (!token) {
        throw new Error("Missing FINNHUB_API_KEY");
      }

      const res = await fetch(url, {
        headers: {
          "X-Finnhub-Token": token,
        },
        next: { revalidate: MARKET_CACHE_SECONDS },
      });

      if (!res.ok) {
        throw new FinnhubError(res.status, `Finnhub ${path} failed: ${res.statusText}`);
      }

      const json = await res.json();
      
      // Optional validation
      if (parser) {
        return parser.parse(json);
      }
      
      return json as T;
    },
    MARKET_CACHE_SECONDS
  );

  return data;
}
