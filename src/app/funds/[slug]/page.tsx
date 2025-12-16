"use client";

import Link from "next/link";
import Metric from "@/components/funds/Metric";
import { getFundBySlug } from "@/lib/funds/mockFunds";
import { MOCK_POSITIONS, MOCK_CASH, MOCK_TRADES } from "@/lib/funds/mockFundDetail";
import PortfolioTable from "@/components/funds/PortfolioTable";
import TradeHistory from "@/components/funds/TradeHistory";
import { useEffect, useState } from "react";
import { getPublicMode } from "@/lib/ui/uiStore";
import { use } from "react";

import PerformanceChart from "@/components/funds/PerformanceChart";
import { getPerfSeries } from "@/lib/funds/mockPerformance";

const fmt = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export default function FundDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const fund = getFundBySlug(slug);
  const [isPublic, setIsPublic] = useState(true);
  const perf = getPerfSeries(slug);

  useEffect(() => {
    setIsPublic(getPublicMode());
  }, []);

  if (!fund) {
    return <div className="p-10 text-white">Fund not found</div>;
  }

  return (
    <main className="">
      <div className="max-w-6xl px-6 py-10">
        <Link href="/funds" className="text-sm text-white/50 hover:text-white">← Back</Link>

        <h1 className="mt-3 text-3xl font-semibold">{fund.name}</h1>
        <p className="mt-2 text-md text-white/60">{fund.description}</p>

        {/* KPIs */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="Fund Return" value={fmt(fund.fundReturnPct)} />
          <Metric label="Benchmark" value={fmt(fund.benchmarkReturnPct)} />
          <Metric label="Excess Return" value={fmt(fund.excessReturnPct)} />
          <Metric label="Max Drawdown" value={`${fund.maxDrawdownPct}%`} />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Metric label="Win Rate" value={`${fund.winRatePct}%`} />
          <Metric label="Trades" value={fund.trades.toString()} sub={`${fund.daysActive} days`} />
        </div>

        {/* Last Session Snapshot (Placeholder for Phase 7C) */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Last Session</h3>
            <div className="text-xs font-mono text-emerald-400 animate-pulse">● Live</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="text-xs text-white/50">Date</div>
              <div className="font-medium">Today</div>
            </div>
            <div>
              <div className="text-xs text-white/50">Daily Return</div>
              <div className="text-xl font-bold text-emerald-400">+1.24%</div>
            </div>
            <div>
              <div className="text-xs text-white/50">vs S&P 500</div>
              <div className="text-xl font-bold text-emerald-400">+0.45%</div>
            </div>
            <div>
              <div className="text-xs text-white/50">Vol (Ann)</div>
              <div className="font-medium">12.5%</div>
            </div>
          </div>
        </div>

        {/* Performance Chart (Phase 7B) */}
        <div className="mt-10">
          <PerformanceChart series={perf} />
        </div>

        {/* Portfolio Table */}
        <div className="mt-12">
          <PortfolioTable 
            positions={MOCK_POSITIONS} 
            cash={MOCK_CASH} 
            isPublic={isPublic} 
          />
        </div>

        {/* Trade History */}
        <div className="mt-12">
          <TradeHistory 
            trades={MOCK_TRADES} 
            isPublic={isPublic} 
          />
        </div>
      </div>
    </main>
  );
}
