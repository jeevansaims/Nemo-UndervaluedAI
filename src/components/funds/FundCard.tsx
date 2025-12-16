import Link from "next/link";
import type { Fund } from "@/lib/funds/mockFunds";
import type { FundMetrics } from "@/lib/metrics/fundMetrics";
import { fmtPct, fmtNum } from "@/lib/metrics/format";

export default function FundCard({ fund, metrics }: { fund: Fund; metrics?: FundMetrics }) {
  // Fallback to mock values if metrics not yet loaded (though normally they will be)
  // But we want to prefer the real computed metrics if provided.

  const annReturn = metrics ? fmtPct(metrics.performance.annualized_return_pct, 1) : `${fund.fundReturnPct}%`;
  const maxDD = metrics ? fmtPct(metrics.risk.max_drawdown_pct, 1) : `${fund.maxDrawdownPct}%`;
  // These didn't exist in mock data, so only show if computed
  const sharpe = metrics ? fmtNum(metrics.risk_adjusted.sharpe_ratio, 2) : "n/a";
  const vol = metrics ? fmtPct(metrics.risk.annualized_volatility_pct, 1) : "n/a";

  return (
    <Link
      href={`/funds/${fund.slug}`}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
    >
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">{fund.name}</h3>
          <p className="mt-1 text-sm text-white/60">{fund.description}</p>
          <p className="mt-2 text-xs text-white/40">
            {fund.daysActive} days • {fund.trades} trades
          </p>
        </div>

        <div className="text-xl font-semibold text-emerald-400">
          {annReturn}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-white/40 whitespace-nowrap">Ann. Vol</div>
          {vol}
        </div>
        <div>
          <div className="text-white/40 whitespace-nowrap">Max DD</div>
          <span className="text-rose-300">{maxDD}</span>
        </div>
        <div>
          <div className="text-white/40 whitespace-nowrap">Sharpe</div>
          <span className="text-emerald-300">{sharpe}</span>
        </div>
         <div>
          {/* Using Excess Return from mock on card logic or switch to Alpha/Beta if preferred. 
              Let's show Beta for now as it's a standard regime metric. */}
          <div className="text-white/40 whitespace-nowrap">Beta</div>
          {metrics ? fmtNum(metrics.relative_to_benchmark.beta, 2) : "n/a"}
        </div>
      </div>
    </Link>
  );
}
