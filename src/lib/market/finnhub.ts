

import { resilientFetch } from "@/lib/api/resilientFetch";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
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
  const query = new URLSearchParams({
    token: FINNHUB_API_KEY || "",
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const url = `https://finnhub.io/api/v1${path}?${query.toString()}`;

  // Wrap in resilience layer
  // Key needs to be unique to the request
  const cacheKey = `finnhub:${path}:${JSON.stringify(params)}`;

  const { data } = await resilientFetch<T>(
    cacheKey,
    async () => {
      // Don't error if key is missing during build, just return null/empty if appropriate or let it fail?
      // Actually, standard fetch behavior is fine, resilientFetch handles the try/catch
      if (!FINNHUB_API_KEY) {
        throw new Error("Missing FINNHUB_API_KEY");
      }

      const res = await fetch(url, {
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
