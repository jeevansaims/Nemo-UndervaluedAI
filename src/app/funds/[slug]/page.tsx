"use client";

import Link from "next/link";
import Metric from "@/components/funds/Metric";
import { getFundBySlug } from "@/lib/funds/mockFunds";
import { MOCK_POSITIONS, MOCK_CASH, MOCK_TRADES } from "@/lib/funds/mockFundDetail";
import PortfolioTable from "@/components/funds/PortfolioTable";
import TradeHistory from "@/components/funds/TradeHistory";
import { useEffect, useState, useMemo } from "react";
import { getPublicMode } from "@/lib/ui/uiStore";
import { use } from "react";

import LastSessionCard from "@/components/funds/LastSessionCard";
import PerformanceChart from "@/components/funds/PerformanceChart";
import { getPerfSeries } from "@/lib/funds/mockPerformance";
import { computeFundMetricsFromPerfSeries } from "@/lib/metrics/fundMetrics";

const fmt = (n: number) => `${n > 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
const fmtDec = (n: number) => n.toFixed(2);

export default function FundDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const fund = getFundBySlug(slug);
  const [isPublic, setIsPublic] = useState(true);
  const perf = getPerfSeries(slug);

  const metrics = useMemo(() => {
    return computeFundMetricsFromPerfSeries({ series: perf });
  }, [perf]);

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
        <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Metric label="Ann. Return" value={fmt(metrics.performance.annualized_return_pct)} />
          <Metric label="Ann. Volatility" value={(metrics.risk.annualized_volatility_pct * 100).toFixed(1) + "%"} />
          <Metric label="Max Drawdown" value={(metrics.risk.max_drawdown_pct * 100).toFixed(1) + "%"} />
          <Metric label="Sharpe Ratio" value={fmtDec(metrics.risk_adjusted.sharpe_ratio ?? 0)} />
        </div>

        <div className="mt-4 grid gap-4 grid-cols-2 lg:grid-cols-4">
           <Metric label="Excess Return" value={fmt(metrics.performance.excess_annualized_return_pct)} />
           <Metric label="Beta" value={fmtDec(metrics.relative_to_benchmark.beta)} />
           <Metric label="Alpha" value={fmt(metrics.relative_to_benchmark.alpha_annualized_pct)} />
            <Metric label="Win Rate" value={(metrics.trading_profile.hit_rate_pct * 100).toFixed(0) + "%"} />
        </div>

        {/* Last Session Snapshot (Phase 7C) */}
        <div className="mt-10">
          <LastSessionCard series={perf} />
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
