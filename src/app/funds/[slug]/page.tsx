/**
 * Fund Detail Page
 * Shows fund holdings, performance chart, and detailed metrics
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import FundPerformanceChart from '@/components/funds/FundPerformanceChart';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function FundDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch fund details
  const res = await fetch(`${BASE_URL}/api/funds/${slug}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    notFound();
  }
  
  const { fund } = await res.json();
  const metrics = fund.metrics;
  
  return (
    <main className="min-h-screen bg-[#232323] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          <span>›</span>
          <Link href="/funds" className="hover:text-white transition">
            Funds
          </Link>
          <span>›</span>
          <span className="text-white font-medium">{fund.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{fund.name}</h1>
          <p className="mt-2 text-lg text-white/60">{fund.description}</p>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
              <div className="text-sm text-white/40 mb-2">Total Return</div>
              <div className="text-2xl font-bold text-emerald-400">
                +{metrics.totalReturn.toFixed(2)}%
              </div>
            </div>
            <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
              <div className="text-sm text-white/40 mb-2">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-emerald-300">
                {metrics.sharpeRatio.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
              <div className="text-sm text-white/40 mb-2">Max Drawdown</div>
              <div className="text-2xl font-bold text-rose-300">
                {metrics.maxDrawdown.toFixed(2)}%
              </div>
            </div>
            <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
              <div className="text-sm text-white/40 mb-2">Volatility</div>
              <div className="text-2xl font-bold">
                {metrics.volatility.toFixed(2)}%
              </div>
            </div>
          </div>

        )}

        {/* Performance Chart */}
        <div className="mb-8">
           <FundPerformanceChart slug={fund.slug} />
        </div>

        {/* Holdings Table */}
        <div className="rounded-lg border border-[#404040] bg-[#313131] p-6">
          <h2 className="text-2xl font-bold mb-4">Current Holdings</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Ticker</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Company</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Weight</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {fund.holdings
                  .sort((a: any, b: any) => b.weightPct - a.weightPct)
                  .map((holding: any) => (
                  <tr key={holding.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono font-semibold">{holding.ticker}</td>
                    <td className="py-3 px-4 text-white/80">{holding.name}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {holding.weightPct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-sm text-white/60">{holding.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-sm text-white/40">
            Total Holdings: {fund.holdings.length} | 
            Last Updated: {new Date(fund.lastUpdated).toLocaleDateString()}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link 
            href="/funds"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
          >
            ← Back to Funds
          </Link>
        </div>
      </div>
    </main>
  );
}
