"use client";

import { getPublicMode } from "@/lib/ui/uiStore";
import { fmtMoneyMaybe, fmtPct } from "@/lib/ui/format";
import type { PerfPoint } from "@/lib/funds/mockPerformance";

function delta(a: number, b: number) {
  return a - b;
}

export default function LastSessionCard({ series }: { series: PerfPoint[] }) {
  const isPublic = typeof window === "undefined" ? true : getPublicMode();

  if (!series || series.length < 2) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold">Last session</div>
        <div className="mt-2 text-sm text-white/50">Not enough data.</div>
      </div>
    );
  }

  const last = series[series.length - 1];
  const prev = series[series.length - 2];

  const fundPct = delta(last.fundPct, prev.fundPct);
  const benchPct = delta(last.benchPct, prev.benchPct);

  const fundMoney =
    last.fundValue !== undefined && prev.fundValue !== undefined
      ? delta(last.fundValue, prev.fundValue)
      : 0;

  const benchMoney =
    last.benchValue !== undefined && prev.benchValue !== undefined
      ? delta(last.benchValue, prev.benchValue)
      : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Last session</div>
          <div className="mt-1 text-xs text-white/50">As of {last.date}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/50">Fund</div>
          <div className="mt-1 text-lg font-semibold">
            {fmtPct(fundPct, 2)}{" "}
            <span className="text-sm text-white/40">
              {fmtMoneyMaybe(fundMoney, isPublic)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/50">Benchmark</div>
          <div className="mt-1 text-lg font-semibold">
            {fmtPct(benchPct, 2)}{" "}
            <span className="text-sm text-white/40">
              {fmtMoneyMaybe(benchMoney, isPublic)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/40">
        Values are derived from the most recent two points in the performance series.
      </div>
    </div>
  );
}
