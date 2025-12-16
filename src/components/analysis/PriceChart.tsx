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
import type { PricePoint } from "@/lib/analysis/mockPriceSeries";

type RangeKey = "1M" | "3M" | "6M" | "ALL";

function filterRange(points: PricePoint[], range: RangeKey) {
  if (range === "ALL") return points;
  const last = points[points.length - 1];
  if (!last) return points;

  const lastDate = new Date(last.date);
  const months = range === "1M" ? 1 : range === "3M" ? 3 : 6;

  const start = new Date(lastDate);
  start.setMonth(start.getMonth() - months);

  return points.filter((p) => new Date(p.date) >= start);
}

export default function PriceChart({ series }: { series: PricePoint[] }) {
  const [range, setRange] = useState<RangeKey>("3M");

  const data = useMemo(() => filterRange(series, range), [series, range]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Price</div>
          <div className="mt-1 text-xs text-white/50">Mock data (replace with real later)</div>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {(["1M", "3M", "6M", "ALL"] as RangeKey[]).map((k) => (
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
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} minTickGap={30} />
            <YAxis tick={{ fontSize: 10, fill: "#888" }} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111", borderColor: "#333", color: "#fff" }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Price"]}
              labelFormatter={(label: any) => `Date: ${label}`}
            />
            <Line type="monotone" dataKey="price" dot={false} strokeWidth={2} stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
