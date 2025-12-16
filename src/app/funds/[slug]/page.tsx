import { getFundBySlug } from "@/lib/funds/mockFunds";
import { getPerfSeries } from "@/lib/funds/mockPerformance"; // Will swap to fetch later
import { computeFundMetricsFromPerfSeries } from "@/lib/metrics/fundMetrics";
import FundDetailView from "@/components/funds/FundDetailView";

// Future: import { headers } from "next/headers"; if needed for host-relative fetch

export default async function FundDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fund = getFundBySlug(slug);

  if (!fund) {
    return <div className="p-10 text-white">Fund not found</div>;
  }

  // Phase 8C: Swap this with fetch('/api/funds/[slug]/performance')
  // For now keeping mock to verify refactor
  const perf = getPerfSeries(slug);
  const metrics = computeFundMetricsFromPerfSeries({ series: perf });

  return <FundDetailView fund={fund} perf={perf} metrics={metrics} />;
}
