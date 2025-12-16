const KEY = "nemo_watchlist_v1";

export function loadWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x).toUpperCase());
  } catch {
    return [];
  }
}

export function saveWatchlist(items: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function toggleWatchlist(ticker: string) {
  const t = ticker.toUpperCase();
  const items = loadWatchlist();
  const exists = items.includes(t);
  const next = exists ? items.filter((x) => x !== t) : [t, ...items];
  saveWatchlist(next);
  return { next, exists: !exists };
}
