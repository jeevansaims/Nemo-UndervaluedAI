import Link from "next/link";
import Metric from "@/components/funds/Metric";
import { getFundBySlug } from "@/lib/funds/mockFunds";

const fmt = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export default async function FundDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fund = getFundBySlug(slug);

  if (!fund) {
    return <div className="p-10 text-white">Fund not found</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/funds" className="text-sm text-white/50">← Back</Link>

        <h1 className="mt-3 text-3xl font-semibold">{fund.name}</h1>
        <p className="mt-2 text-md text-white/60">{fund.description}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="Fund Return" value={fmt(fund.fundReturnPct)} />
          <Metric label="Benchmark" value={fmt(fund.benchmarkReturnPct)} />
          <Metric label="Excess Return" value={fmt(fund.excessReturnPct)} />
          <Metric label="Max Drawdown" value={`${fund.maxDrawdownPct}%`} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Metric label="Win Rate" value={`${fund.winRatePct}%`} />
          <Metric label="Trades" value={fund.trades.toString()} sub={`${fund.daysActive} days`} />
        </div>
      </div>
    </main>
  );
}
