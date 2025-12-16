import Link from "next/link";
import type { Fund } from "@/lib/funds/mockFunds";

const fmt = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export default function FundCard({ fund }: { fund: Fund }) {
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
          {fmt(fund.fundReturnPct)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-white/40">Benchmark</div>
          {fmt(fund.benchmarkReturnPct)}
        </div>
        <div>
          <div className="text-white/40">Excess</div>
          <span className="text-emerald-300">{fmt(fund.excessReturnPct)}</span>
        </div>
        <div>
          <div className="text-white/40">Max DD</div>
          <span className="text-rose-300">{fund.maxDrawdownPct}%</span>
        </div>
      </div>
    </Link>
  );
}
