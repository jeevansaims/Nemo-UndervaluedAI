"use client";

import { useWatchlist } from "@/lib/watchlist/useWatchlist";

export default function WatchlistButton({ ticker }: { ticker: string }) {
  const { hasTicker, addTicker, removeTicker, loading } = useWatchlist();
  const inList = hasTicker(ticker);

  return (
    <button
      disabled={loading}
      onClick={() => {
        if (inList) removeTicker(ticker);
        else addTicker(ticker);
      }}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      {inList ? "★ Watchlisted" : "☆ Add to watchlist"}
    </button>
  );
}
