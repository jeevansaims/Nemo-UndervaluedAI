import Link from "next/link";
import FundCard from "@/components/funds/FundCard";
import { MOCK_FUNDS } from "@/lib/funds/mockFunds";
import PublicModeToggle from "@/components/ui/PublicModeToggle";
import { getFundPerformance } from "@/lib/data/fundData";
import { computeFundMetricsFromPerfSeries } from "@/lib/metrics/fundMetrics";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function FundsPage() {
  // Fetch performance for all funds in parallel
  const fundsWithMetrics = await Promise.all(
    MOCK_FUNDS.map(async (fund) => {
      try {
        const perf = await getFundPerformance({ 
          slug: fund.slug, 
          range: "1Y", 
          baseUrl: BASE_URL 
        });
        const metrics = computeFundMetricsFromPerfSeries({ series: perf });
        return { ...fund, metrics, perf };
      } catch (e) {
        console.error(`Failed to load perf for ${fund.slug}`, e);
        return { ...fund, metrics: undefined, perf: [] };
      }
    })
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-white/50 hover:text-white">
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold">Institutional Funds</h1>
          </div>
          <PublicModeToggle />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Hypothetical performance. Strategies intentionally undisclosed.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {fundsWithMetrics.map((item) => (
             <FundCard key={item.slug} fund={item} metrics={item.metrics} />
          ))}
        </div>
      </div>
    </main>
  );
}
