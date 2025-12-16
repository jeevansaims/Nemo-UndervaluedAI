import { getFundBySlug } from "@/lib/funds/mockFunds";
import { computeFundMetricsFromPerfSeries } from "@/lib/metrics/fundMetrics";
import FundDetailView from "@/components/funds/FundDetailView";
import { getFundPerformance } from "@/lib/data/fundData";

// Hardcoded base URL for server-side fetches
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Future: import { headers } from "next/headers"; if needed for host-relative fetch

export default async function FundDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fund = getFundBySlug(slug);

  if (!fund) {
    return <div className="p-10 text-white">Fund not found</div>;
  }

  // Phase 8C: Using real data provider
  const perf = await getFundPerformance({ 
    slug, 
    range: "1Y", 
    baseUrl: BASE_URL 
  });
  
  const metrics = computeFundMetricsFromPerfSeries({ series: perf });

  return <FundDetailView fund={fund} perf={perf} metrics={metrics} />;
}
