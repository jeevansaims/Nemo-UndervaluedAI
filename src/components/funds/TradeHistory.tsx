"use client";

import { useState } from "react";

export default function TradeHistory({ trades, privateMode }: { trades: any[], privateMode: boolean }) {
  const showPrivateFields = privateMode;

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-6">
      <h3 className="mb-4 text-xl font-semibold">Recent Trades</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="pb-3">Date</th>
              <th className="pb-3">Ticker</th>
              <th className="pb-3">Action</th>
              {showPrivateFields && <th className="pb-3 text-right">Qty</th>}
              {showPrivateFields && <th className="pb-3 text-right">Price</th>}
              {showPrivateFields && <th className="pb-3 pl-4">Rationale</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {trades.map((t, i) => (
              <tr key={i}>
                <td className="py-3 text-white/60">
                    {new Date(t.ts * 1000).toLocaleDateString()}
                </td>
                <td className="py-3 font-medium">{t.ticker}</td>
                <td className={`py-3 ${t.action === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>
                  {t.action}
                </td>
                {showPrivateFields && <td className="py-3 text-right">{t.qty ?? "—"}</td>}
                {showPrivateFields && <td className="py-3 text-right">{t.price ? `$${t.price.toFixed(2)}` : "—"}</td>}
                {showPrivateFields && <td className="py-3 pl-4 text-white/50 max-w-xs truncate" title={t.rationale}>{t.rationale ?? "—"}</td>}
              </tr>
            ))}
             {trades.length === 0 && (
                <tr>
                    <td colSpan={6} className="py-4 text-center text-white/40">No trades found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
