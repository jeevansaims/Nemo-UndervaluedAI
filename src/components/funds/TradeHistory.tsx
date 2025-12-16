"use client";

import { Trade } from "@/lib/funds/mockFundDetail";
import { useState } from "react";
import { fmtMoneyMaybe } from "@/lib/ui/format";

export default function TradeHistory({
  trades,
  isPublic,
}: {
  trades: Trade[];
  isPublic: boolean;
}) {
  const [filter, setFilter] = useState<"All" | "Buy" | "Sell">("All");

  const filtered = trades.filter((t) => filter === "All" || t.side === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trade History</h3>
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
          {(["All", "Buy", "Sell"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                filter === opt
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((trade) => (
          <div
            key={trade.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${
                    trade.side === "Buy"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {trade.side}
                </div>
                <div>
                  <div className="font-bold text-lg">{trade.ticker}</div>
                  <div className="text-xs text-white/40">{trade.date}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-white/60">Notional</div>
                <div className="font-mono text-white">
                    {fmtMoneyMaybe(trade.amount, isPublic)}
                </div>
                {trade.pnl && !isPublic && (
                   <div className={`text-xs mt-1 ${trade.pnl > 0 ? "text-emerald-400": "text-rose-400"}`}>
                       {trade.pnl > 0 ? "+" : ""}${trade.pnl.toLocaleString()}
                   </div> 
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-xs font-semibold text-white/30 uppercase mb-1">
                    Strategy Thesis
                </div>
                <div className={`text-sm text-white/70 leading-relaxed ${isPublic ? "blur-sm select-none" : ""}`}>
                    {trade.thesis}
                </div>
                {isPublic && (
                    <div className="text-[10px] text-emerald-400 mt-1 italic">
                        Hidden in public mode
                    </div>
                )}
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/40 text-sm">
                No trades found for this filter.
            </div>
        )}
      </div>
    </div>
  );
}
