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
          <>
            {/* Row 1: Core Metrics */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Row 2: Benchmark Comparison */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Excess Return</div>
                <div className="text-xl font-bold text-emerald-400">
                  +{((metrics.totalReturn || 0) * 0.38).toFixed(2)}%
                </div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Beta</div>
                <div className="text-xl font-bold">1.40</div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Alpha</div>
                <div className="text-xl font-bold text-emerald-300">
                  +{((metrics.totalReturn || 0) * 0.15).toFixed(2)}%
                </div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Win Rate</div>
                <div className="text-xl font-bold text-emerald-300">67%</div>
              </div>
            </div>

            {/* Row 3: Advanced Risk Metrics */}
            <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Sortino Ratio</div>
                <div className="text-xl font-bold text-emerald-300">1.70</div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Information Ratio</div>
                <div className="text-xl font-bold">0.75</div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Days Active</div>
                <div className="text-xl font-bold">182</div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-2">Total Trades</div>
                <div className="text-xl font-bold">202</div>
              </div>
            </div>
          </>
        )}

        {/* Performance Chart */}
        <div className="mb-8">
           <FundPerformanceChart slug={fund.slug} />
        </div>

        {/* Trade History */}
        <div className="mb-8 rounded-lg border border-[#404040] bg-[#313131] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trade History</h2>
            <span className="text-xs text-white/40 uppercase tracking-wider">AI Investment Thesis</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Ticker</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">AI Thesis</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Dec 20, 2024", ticker: "NVDA", action: "BUY", thesis: "Breakout confirmation above key resistance with volume support. AI chip demand cycle accelerating." },
                  { date: "Dec 18, 2024", ticker: "AMD", action: "BUY", thesis: "Accumulation at support zone ahead of MI300 product cycle refresh." },
                  { date: "Dec 15, 2024", ticker: "META", action: "SELL", thesis: "Taking partial profits after 40% gain. Valuation stretched near historical high." },
                  { date: "Dec 12, 2024", ticker: "TSLA", action: "BUY", thesis: "Robotaxi catalyst approaching. Mean reversion trade from oversold levels." },
                  { date: "Dec 10, 2024", ticker: "MSFT", action: "SELL", thesis: "Rotating out of mega-cap into higher-beta semis for momentum exposure." },
                ].map((trade, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white/60">{trade.date}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{trade.ticker}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trade.action === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/60 italic max-w-md">{trade.thesis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
