"use client";

import { useEffect, useState } from "react";
import { loadWatchlist, toggleWatchlist } from "@/lib/analysis/watchlistStore";

export default function WatchlistButton({ ticker }: { ticker: string }) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    const wl = loadWatchlist();
    setInList(wl.includes(ticker.toUpperCase()));
  }, [ticker]);

  return (
    <button
      onClick={() => {
        const res = toggleWatchlist(ticker);
        setInList(res.exists);
      }}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
    >
      {inList ? "★ Watchlisted" : "☆ Add to watchlist"}
    </button>
  );
}
