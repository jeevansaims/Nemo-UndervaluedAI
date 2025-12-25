import Link from "next/link";

interface FundCardProps {
  fund: {
    slug: string;
    name: string;
    description: string | null;
    currentValue: number;
    holdingsCount: number;
    metrics: {
      totalReturn: number;
      volatility: number;
      maxDrawdown: number;
      sharpeRatio: number;
    } | null;
  };
}

export default function FundCard({ fund }: FundCardProps) {
  const metrics = fund.metrics;
  
  return (
    <Link
      href={`/funds/${fund.slug}`}
      className="rounded-2xl border border-[#404040] bg-[#303741] p-6 transition hover:bg-[#313131]"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{fund.name}</h3>
          <p className="mt-2 text-sm text-white/60">{fund.description}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">
            {metrics ? `+${metrics.totalReturn.toFixed(1)}%` : '-'}
          </div>
          <div className="text-xs text-white/40 mt-1">1Y Return</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-white/40 text-xs mb-1">Sharpe</div>
          <div className="font-medium text-emerald-300">
            {metrics ? metrics.sharpeRatio.toFixed(2) : '-'}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-xs mb-1">Max DD</div>
          <div className="font-medium text-rose-300">
            {metrics ? `${metrics.maxDrawdown.toFixed(1)}%` : '-'}
          </div>
        </div>
        <div>
          <div className="text-white/40 text-xs mb-1">Holdings</div>
          <div className="font-medium">
            {fund.holdingsCount}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-white/40">
          Current Value: <span className="text-white font-medium">{fund.currentValue.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
