"use client";

import { useState } from 'react';
import type { InsiderTrade } from '@/lib/insider/generateInsiderData';

export default function InsiderTable({ trades }: { trades: InsiderTrade[] }) {
  const [filter, setFilter] = useState<'All' | 'Buy' | 'Sell'>('All');

  const filtered = trades.filter(t => {
    if (filter === 'All') return true;
    return t.transactionType === filter;
  });

  return (
    <div className="rounded-xl border border-[#404040] bg-[#303741] overflow-hidden">
      {/* Table Header / Filters */}
      <div className="flex items-center justify-between p-4 border-b border-[#404040] bg-[#313131]/50">
        <h3 className="font-semibold text-lg">Recent Transactions</h3>
        <div className="flex gap-2">
          {['All', 'Buy', 'Sell'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                filter === f 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                  : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-left border-b border-[#404040]">
              <th className="py-3 px-4 font-normal">Ticker</th>
              <th className="py-3 px-4 font-normal">Insider</th>
              <th className="py-3 px-4 font-normal">Relationship</th>
              <th className="py-3 px-4 font-normal">Date</th>
              <th className="py-3 px-4 font-normal">Type</th>
              <th className="py-3 px-4 font-normal text-right">Value</th>
              <th className="py-3 px-4 font-normal text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#404040]">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-white/5 transition">
                <td className="py-3 px-4">
                  <div className="font-bold text-white">{t.ticker}</div>
                  <div className="text-xs text-white/40">{t.companyName}</div>
                </td>
                <td className="py-3 px-4 font-medium text-white/80">
                  {t.insiderName}
                </td>
                <td className="py-3 px-4 text-white/50 text-xs">
                  {t.relation}
                </td>
                <td className="py-3 px-4 text-white/50">
                  {new Date(t.reportDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    t.transactionType === 'Buy' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {t.transactionType}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-white/90">
                  ${(t.value / 1000000).toFixed(2)}M
                </td>
                <td className="py-3 px-4 text-right text-white/60">
                  ${t.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filtered.length === 0 && (
        <div className="p-8 text-center text-white/40">
          No transactions found for this filter.
        </div>
      )}
    </div>
  );
}
