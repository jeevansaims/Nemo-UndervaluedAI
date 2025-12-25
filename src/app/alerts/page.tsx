"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InsiderTable from "@/components/insider/InsiderTable";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function AlertsPage() {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ buyVolume: 0, sellVolume: 0, buyCount: 0, sellCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${BASE_URL}/api/insider-alerts`);
        const data = await res.json();
        setTrades(data.trades);
        setStats(data.stats);
      } catch (e) {
        console.error("Failed to load insider alerts", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#303741] text-white pt-16">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Insider Trading Alerts</h1>
          <p className="mt-2 text-white/60">
            Real-time tracking of high-value insider transactions. Detect cluster buying and significant sell-offs.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-[#404040] bg-[#313131]">
            <div className="text-sm text-white/40">24h Insider Buying</div>
            <div className="text-2xl font-bold text-emerald-400">
              ${(stats.buyVolume / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#404040] bg-[#313131]">
            <div className="text-sm text-white/40">buying Transactions</div>
            <div className="text-2xl font-bold text-white">
              {stats.buyCount}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#404040] bg-[#313131]">
            <div className="text-sm text-white/40">24h Insider Selling</div>
            <div className="text-2xl font-bold text-rose-400">
              ${(stats.sellVolume / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[#404040] bg-[#313131]">
            <div className="text-sm text-white/40">Selling Transactions</div>
            <div className="text-2xl font-bold text-white">
              {stats.sellCount}
            </div>
          </div>
        </div>

        {loading ? (
           <div className="h-64 flex items-center justify-center text-white/30">
             Loading insider data...
           </div>
        ) : (
          <InsiderTable trades={trades} />
        )}
      </div>
    </main>
  );
}
