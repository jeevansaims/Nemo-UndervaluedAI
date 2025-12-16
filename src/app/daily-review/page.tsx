"use client";

import { MOCK_DAILY } from "@/lib/calendar/mockDaily";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getPublicMode } from "@/lib/ui/uiStore";
import { fmtMoneyMaybe } from "@/lib/ui/format";

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export default function DailyReviewPage() {
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    setIsPublic(getPublicMode());
  }, []);

  // Sort by date descending
  const sorted = [...MOCK_DAILY].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="">
      <div className="max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-white/50 hover:text-white">
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold">Daily Performance Review</h1>
          </div>
          {/* Toggle moved to sidebar */}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-white/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Fund</th>
                <th className="px-6 py-4 font-semibold text-right">Net P/L</th>
                <th className="px-6 py-4 font-semibold text-right">Trades</th>
                <th className="px-6 py-4 font-semibold text-right">Win %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((day) => (
                <tr key={`${day.date}-${day.fund}`} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-white/80">{day.date}</td>
                  <td className="px-6 py-4 text-white/60">{day.fund}</td>
                  <td
                    className={`px-6 py-4 text-right font-mono font-medium ${
                      day.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {fmtMoneyMaybe(day.pnl, isPublic)}
                  </td>
                  <td className="px-6 py-4 text-right text-white/80">{day.trades}</td>
                  <td className="px-6 py-4 text-right text-white/80">
                    {day.winRatePct.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
