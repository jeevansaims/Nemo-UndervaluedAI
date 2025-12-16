"use client";

import { Position, CashPosition } from "@/lib/funds/mockFundDetail";
import { useMemo } from "react";
import { getPublicMode } from "@/lib/ui/uiStore";
import { fmtMoneyMaybe } from "@/lib/ui/format";

// Since we want the table to be reactive to global toggle but maybe local state too?
// For now, let's accept isPublic as prop or use hook. 
// Using hook at top level page and passing down is cleaner, but component-level generic usage works too.
// Let's passed isPublic from parent for consistency.

export default function PortfolioTable({
  positions,
  cash,
  isPublic,
}: {
  positions: Position[];
  cash: CashPosition;
  isPublic: boolean;
}) {
  const sorted = [...positions].sort((a, b) => b.weightPct - a.weightPct);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Current Portfolio</h3>
        <div className="text-xs text-white/40">Holdings & Weighting</div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs text-white/50 uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">Ticker</th>
              <th className="px-6 py-3 font-semibold text-right">Value</th>
              <th className="px-6 py-3 font-semibold text-right">Weight</th>
              <th className="px-6 py-3 font-semibold text-right">Day %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((pos) => (
              <tr key={pos.ticker} className="group hover:bg-white/5 transition">
                <td className="px-6 py-3">
                  <div className="font-bold text-white">{pos.ticker}</div>
                  <div className="text-xs text-white/40">{pos.name}</div>
                </td>
                <td className="px-6 py-3 text-right font-mono text-white/80">
                  {fmtMoneyMaybe(pos.value, isPublic)}
                </td>
                <td className="px-6 py-3 text-right text-white/80">
                  {pos.weightPct.toFixed(1)}%
                </td>
                <td
                  className={`px-6 py-3 text-right font-medium ${
                    pos.dayChangePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {pos.dayChangePct > 0 ? "+" : ""}
                  {pos.dayChangePct.toFixed(2)}%
                </td>
              </tr>
            ))}
            
            {/* Cash Row */}
            <tr className="bg-white/5 font-medium">
              <td className="px-6 py-3 text-white/60 font-semibold">CASH / LIQUIDITY</td>
              <td className="px-6 py-3 text-right font-mono text-white/80">
                {fmtMoneyMaybe(cash.value, isPublic)}
              </td>
              <td className="px-6 py-3 text-right text-white/80">
                {cash.weightPct.toFixed(1)}%
              </td>
              <td className="px-6 py-3 text-right text-white/40">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
