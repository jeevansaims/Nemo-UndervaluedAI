"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerfPoint } from "@/lib/funds/mockPerformance";
import { getPublicMode } from "@/lib/ui/uiStore";
import { fmtMoneyMaybe, fmtPct } from "@/lib/ui/format";

type RangeKey = "1M" | "3M" | "YTD" | "ALL";

function filterRange(points: PerfPoint[], range: RangeKey) {
  if (range === "ALL") return points;

  const last = points[points.length - 1];
  if (!last) return points;

  const lastDate = new Date(last.date);

  if (range === "YTD") {
    const start = new Date(lastDate.getFullYear(), 0, 1);
    return points.filter((p) => new Date(p.date) >= start);
  }

  const months = range === "1M" ? 1 : 3;
  const start = new Date(lastDate);
  start.setMonth(start.getMonth() - months);

  return points.filter((p) => new Date(p.date) >= start);
}

export default function PerformanceChart({
  title = "Performance history",
  series,
}: {
  title?: string;
  series: PerfPoint[];
}) {
  const isPublic = typeof window === "undefined" ? true : getPublicMode();

  const [range, setRange] = useState<RangeKey>("ALL");
  const [view, setView] = useState<"pct" | "money">("pct");

  const data = useMemo(() => filterRange(series, range), [series, range]);

  const showMoney = !isPublic && view === "money";

  const chartData = useMemo(() => {
    return data.map((p) => ({
      date: p.date,
      fund: showMoney ? p.fundValue : p.fundPct,
      bench: showMoney ? p.benchValue : p.benchPct,
    }));
  }, [data, showMoney]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-white/50">
            {isPublic ? "Public view (percent only)" : "Private view"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Range */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {(["1M", "3M", "YTD", "ALL"] as RangeKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setRange(k)}
                className={`rounded-lg px-3 py-1 text-xs transition ${
                  range === k ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* View toggle */}
          {!isPublic ? (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setView("pct")}
                className={`rounded-lg px-3 py-1 text-xs transition ${
                  view === "pct" ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                %
              </button>
              <button
                onClick={() => setView("money")}
                className={`rounded-lg px-3 py-1 text-xs transition ${
                  view === "money" ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                $
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }}
              tickLine={false} axisLine={false}
              tickFormatter={(v: number) =>
                showMoney ? fmtMoneyMaybe(v, isPublic) : fmtPct(v, 0)
              }
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
              itemStyle={{ fontSize: "12px" }}
              formatter={(value: any, name: any) => {
                const v = Number(value);
                const label = name === "fund" ? "Fund" : "Benchmark";
                return [
                  showMoney ? fmtMoneyMaybe(v, isPublic) : fmtPct(v, 2),
                  label,
                ];
              }}
              labelFormatter={(label: any) => `Date: ${label}`}
            />
            <Line type="monotone" dataKey="bench" dot={false} strokeWidth={2} stroke="#525252" opacity={0.5} />
            <Line type="monotone" dataKey="fund" dot={false} strokeWidth={2} stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs text-white/40">
        Benchmark shown for comparison. Strategy details intentionally undisclosed.
      </div>
    </div>
  );
}
