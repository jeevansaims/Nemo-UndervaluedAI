"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { loadWatchlist, saveWatchlist } from "@/lib/analysis/watchlistStore";

export function useWatchlist() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    if (status === "loading") return;

    if (isAuthenticated) {
      // API source
      fetch("/api/user/watchlist")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch");
        })
        .then((data) => {
          setTickers(data.tickers || []);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    } else {
      // Local source
      setTickers(loadWatchlist());
      setLoading(false);
    }
  }, [status, isAuthenticated]);

  const addTicker = useCallback(async (ticker: string) => {
    const t = ticker.toUpperCase().trim();
    if (!t) return;

    // Optimistic update
    setTickers((prev) => {
      if (prev.includes(t)) return prev;
      return [...prev, t].sort();
    });

    if (isAuthenticated) {
      try {
        await fetch("/api/user/watchlist", {
          method: "POST",
          body: JSON.stringify({ ticker: t }),
        });
      } catch (e) {
        console.error("Failed to sync add", e);
        // Revert? For now, just log.
      }
    } else {
      // Sync to local
       // We need to read fresh state to avoid closure staleness if possible, 
       // but here we just rely on the effect below or manual save?
       // Actually `saveWatchlist` takes an array.
       // Let's do it cleaner: fetch fresh from local, add, save.
       // Or simpler:
       const current = loadWatchlist();
       if (!current.includes(t)) {
         saveWatchlist([...current, t].sort());
       }
    }
  }, [isAuthenticated]);

  const removeTicker = useCallback(async (ticker: string) => {
    const t = ticker.toUpperCase().trim();
    
    // Optimistic
    setTickers((prev) => prev.filter((x) => x !== t));

    if (isAuthenticated) {
      try {
        await fetch(`/api/user/watchlist?ticker=${t}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.error("Failed to sync remove", e);
      }
    } else {
      const current = loadWatchlist();
      saveWatchlist(current.filter((x) => x !== t));
    }
  }, [isAuthenticated]);

  const hasTicker = useCallback((ticker: string) => {
    return tickers.includes(ticker.toUpperCase().trim());
  }, [tickers]);

  return {
    tickers,
    loading,
    addTicker,
    removeTicker,
    hasTicker,
  };
}
