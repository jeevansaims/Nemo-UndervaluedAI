"use client";

import Link from "next/link";

function BucketBadge({ bucket }: { bucket?: "SMALL" | "MED" | "LARGE" }) {
  if (!bucket) return null;
  const colors = {
      SMALL: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      MED: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
      LARGE: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${colors[bucket]}`}>
      {bucket}
    </span>
  );
}

function getBucket(weight?: number | null): "SMALL" | "MED" | "LARGE" | undefined {
    if (typeof weight !== "number") return undefined;
    if (weight >= 12) return "LARGE";
    if (weight >= 5) return "MED";
    return "SMALL";
}

export default function PortfolioTable({ positions, cash, privateMode }: { positions: any[], cash: any, privateMode: boolean }) {
  // If we have cash, render it (optionally hide exact cash in public if wanted, but user didn't specify)
  // Focusing on positions from API which have `weightPct` possibly null or `bucket`.
  
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/5 p-6">
      <h3 className="mb-4 text-xl font-semibold">Holdings</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="pb-3">Ticker</th>
            <th className="pb-3 text-right">Weight</th>
            <th className="pb-3 pl-6">Rationale / Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/80">
          {positions.map((p) => (
            <tr key={p.ticker}>
              <td className="py-3 font-medium">
                  {p.ticker}
                  {p.name && <div className="text-xs text-white/40 font-normal">{p.name}</div>}
              </td>
              <td className="py-3 text-right">
                  {privateMode && typeof p.weightPct === "number"
                    ? `${p.weightPct.toFixed(1)}%`
                    : <BucketBadge bucket={p.bucket || getBucket(p.weightPct)} />
                  }
              </td>
              <td className="py-3 pl-6 text-white/50">
                  {privateMode ? (p.rationale ?? "—") : "—"}
              </td>
            </tr>
          ))}
          {/* Cash row */}
          {privateMode && cash && (
             <tr className="text-white/40">
                 <td className="py-3">CASH</td>
                 <td className="py-3 text-right">{cash.weightPct}%</td>
                 <td className="py-3 pl-6">Uninvested capital</td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
