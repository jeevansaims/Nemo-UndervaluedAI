"use client";

import { useEffect, useMemo, useState } from "react";
import AlertFilters from "@/components/alerts/AlertFilters";
import AlertCard from "@/components/alerts/AlertCard";
import type { AlertItem } from "@/lib/alerts/alertSchemas";
import { useWatchlist } from "@/lib/watchlist/useWatchlist";
import { useAlertSettings } from "@/lib/alerts/useAlertSettings";

export default function AlertsPage() {
  const { enabledTypes, setTypeFilter } = useAlertSettings();
  // We still use local state active to control UI immediately, 
  // but we sync with enabledTypes from hook.
  // Actually, let's drive it from the hook entirely if possible.
  // The hook returns 'ALL' or AlertType[]. 
  // Our UI expects 'active' to be single string.
  
  // Let's assume simplest case: One active filter at a time persisted.
  // Hook enabledTypes is AlertType[] | "ALL" -> we cast to single for UI
  const active = Array.isArray(enabledTypes) ? enabledTypes[0] : "ALL";

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { tickers, loading: watchlistLoading } = useWatchlist();

  useEffect(() => {
    if (watchlistLoading) return;

    async function fetchAlerts() {
      setLoading(true);
      try {
        const query = tickers.length ? `?tickers=${tickers.join(",")}` : "";
        const res = await fetch(`/api/alerts${query}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAlerts(data.alerts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [tickers, watchlistLoading]);

  const filtered = useMemo(() => {
    if (active === "ALL") return alerts;
    return alerts.filter((a) => a.type === active);
  }, [alerts, active]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-white/50">Monitoring {tickers.length ? tickers.join(", ") : "Top Market"}</div>
            <h1 className="mt-2 text-3xl font-semibold">Alerts</h1>
            <p className="mt-2 text-sm text-white/60">
              Real-time feed from Finnhub (News, Earnings).
            </p>
          </div>

          <AlertFilters active={active} onChange={setTypeFilter} />
        </div>

        {loading ? (
          <div className="mt-12 text-center text-white/40">Loading latest signals...</div>
        ) : (
          <div className="mt-8 grid gap-4">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-white/40">
                No alerts found. Try adding more tickers to your watchlist.
              </div>
            ) : (
              filtered.map((a) => <AlertCard key={a.id} a={a} />)
            )}
          </div>
        )}
      </div>
    </main>
  );
}
