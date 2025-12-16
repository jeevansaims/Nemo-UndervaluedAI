"use client";

import { useMemo, useState } from "react";
import AlertFilters from "@/components/alerts/AlertFilters";
import AlertCard from "@/components/alerts/AlertCard";
import { buildMockAlerts, type AlertType } from "@/lib/alerts/mockAlerts";
import { loadWatchlist } from "@/lib/analysis/watchlistStore";

export default function AlertsPage() {
  const [active, setActive] = useState<"ALL" | AlertType>("ALL");

  // Use watchlist tickers to make alerts feel "personalized"
  const tickers = useMemo(() => {
    const wl = typeof window === "undefined" ? [] : loadWatchlist();
    return wl.length ? wl : ["AAPL", "MSFT", "NVDA", "TSLA", "SPY"];
  }, []);

  const alerts = useMemo(() => buildMockAlerts(tickers), [tickers]);

  const filtered = useMemo(() => {
    if (active === "ALL") return alerts;
    return alerts.filter((a) => a.type === active);
  }, [alerts, active]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-white/50">Monitoring</div>
            <h1 className="mt-2 text-3xl font-semibold">Alerts</h1>
            <p className="mt-2 text-sm text-white/60">
              Local-first alerts feed (mock). No trade instructions. Not investment advice.
            </p>
          </div>

          <AlertFilters active={active} onChange={setActive} />
        </div>

        <div className="mt-8 grid gap-4">
          {filtered.map((a) => (
            <AlertCard key={a.id} a={a} />
          ))}
        </div>
      </div>
    </main>
  );
}
