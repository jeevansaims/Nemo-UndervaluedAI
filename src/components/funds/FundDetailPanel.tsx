'use client';

import { useState } from 'react';
import { useFundData } from '@/hooks/useFundData';
import FundMethodologyPanel from './FundMethodologyPanel';
import FundPerformanceChart from './FundPerformanceChart';
import AllocationBars from './AllocationBars';
import BrokerConnectionCard from '@/components/broker/BrokerConnectionCard';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { getFundMethodology, generateSectorAllocation, generateGeoAllocation, generateMarketCapAllocation } from '@/lib/funds/generateFundData';

interface FundDetailPanelProps {
  fundSlug: string;
}

export default function FundDetailPanel({ fundSlug }: FundDetailPanelProps) {
  const { fund, loading, error } = useFundData(fundSlug);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMethodology, setShowMethodology] = useState(true);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#232323]">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#232323]">
        <p className="text-white/50">Failed to load fund details</p>
      </div>
    );
  }

  const metrics = fund.metrics as any;
  const methodology = getFundMethodology(fundSlug);
  const sectorAllocation = fund.sectorAllocation || generateSectorAllocation(fund.holdings);
  const geoAllocation = fund.geoAllocation || generateGeoAllocation(fundSlug);
  const marketCapAllocation = fund.marketCapAllocation || generateMarketCapAllocation(fundSlug);

  return (
    <div className="flex-1 overflow-y-auto bg-[#232323]">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{fund.name}</h1>
          <p className="text-white/60 mt-2">{fund.description}</p>
        </div>

        {/* Methodology - Collapsible */}
        <div className="rounded-xl border border-[#404040] bg-[#313131]">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="w-full flex items-center justify-between p-6"
          >
            <h2 className="text-xl font-bold">Fund Methodology</h2>
            {showMethodology ? (
              <ChevronUp className="h-5 w-5 text-white/50" />
            ) : (
              <ChevronDown className="h-5 w-5 text-white/50" />
            )}
          </button>
          
          {showMethodology && (
            <div className="px-6 pb-6 space-y-4 border-t border-[#404040]">
              <div className="pt-4">
                <h3 className="text-sm font-semibold text-white/90 mb-2">Universe</h3>
                <p className="text-sm text-white/60 leading-relaxed">{methodology.universe}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-2">Selection</h3>
                <p className="text-sm text-white/60 leading-relaxed">{methodology.selection}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90 mb-2">Rebalancing</h3>
                <p className="text-sm text-white/60 leading-relaxed">{methodology.rebalancing}</p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="space-y-4">
            {/* Core Metrics - Always Visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-1">Fund Perf.</div>
                <div className="text-2xl font-bold text-emerald-400">
                  +{metrics.totalReturn?.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-1">S&P 500 Perf.</div>
                <div className="text-2xl font-bold text-white">
                  +{(metrics.benchmarkReturn || 17.2).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-1">Total Excess Return</div>
                <div className="text-2xl font-bold text-emerald-400">
                  +{(metrics.excessReturn || metrics.totalReturn - 17.2).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                <div className="text-sm text-white/40 mb-1">Days Active</div>
                <div className="text-2xl font-bold text-white">
                  {metrics.daysActive || 208}
                </div>
              </div>
            </div>

            {/* Advanced Statistics Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-2"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Statistics
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Advanced Metrics - Toggleable */}
            {showAdvanced && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">Sharpe Ratio</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.sharpeRatio?.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">β vs S&P 500</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.beta?.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">α (Jensen) Ann.</div>
                  <div className="text-xl font-bold text-emerald-400">
                    +{metrics.alpha?.toFixed(0)}%
                  </div>
                </div>
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">Win Rate</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.winRate?.toFixed(0)}%
                  </div>
                </div>
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">Max Drawdown</div>
                  <div className="text-xl font-bold text-rose-300">
                    {metrics.maxDrawdown?.toFixed(0)}%
                  </div>
                </div>
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">Sortino Ratio</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.sortinoRatio?.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">Information Ratio</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.informationRatio?.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-lg border border-[#404040] bg-[#313131] p-4">
                  <div className="text-sm text-white/40 mb-1">Total Trades</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.totalTrades || 228}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Chart */}
        <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
          <h2 className="text-xl font-bold mb-4">Performance</h2>
          <FundPerformanceChart slug={fundSlug} />
        </div>

        {/* Allocation Bars */}
        <div className="rounded-xl border border-[#404040] bg-[#313131] p-6">
          <AllocationBars
            sectorAllocation={sectorAllocation}
            geoAllocation={geoAllocation}
            marketCapAllocation={marketCapAllocation}
          />
        </div>

        {/* Holdings Table */}
        <div className="rounded-lg border border-[#404040] bg-[#313131] p-6">
          <h2 className="text-xl font-bold mb-4">Current Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Ticker</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Company</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Weight</th>
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
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Broker Connection */}
        <BrokerConnectionCard />
      </div>
    </div>
  );
}
