"use client";

import { useMemo, useState } from "react";
import DayCell from "@/components/calendar/DayCell";
import { MOCK_DAILY } from "@/lib/calendar/mockDaily";
import { buildMonthGrid, calcMonthStats, formatYYYYMM, parseYYYYMM } from "@/lib/calendar/calendarUtils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthTitle(yyyymm: string) {
  const d = parseYYYYMM(yyyymm);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export default function CalendarPage() {
  const [yyyymm, setYyyymm] = useState<string>(() => formatYYYYMM(new Date()));

  const grid = useMemo(() => buildMonthGrid(yyyymm, MOCK_DAILY), [yyyymm]);
  const stats = useMemo(() => calcMonthStats(yyyymm, MOCK_DAILY), [yyyymm]);

  function prevMonth() {
    const d = parseYYYYMM(yyyymm);
    d.setMonth(d.getMonth() - 1);
    setYyyymm(formatYYYYMM(d));
  }

  function nextMonth() {
    const d = parseYYYYMM(yyyymm);
    d.setMonth(d.getMonth() + 1);
    setYyyymm(formatYYYYMM(d));
  }

  function goToday() {
    setYyyymm(formatYYYYMM(new Date()));
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">P/L Calendar</h1>
            <p className="mt-2 text-sm text-white/60">
              Daily performance view. Strategy labels can be blurred (Phase 2B).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              ←
            </button>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
              {monthTitle(yyyymm)}
            </div>
            <button onClick={nextMonth} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              →
            </button>
            <button onClick={goToday} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              Today
            </button>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Month P/L</div>
            <div className={`mt-1 text-2xl font-semibold ${stats.totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {money(stats.totalPnl)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">ROM (proxy)</div>
            <div className="mt-1 text-2xl font-semibold text-white/90">
              {stats.romPct >= 0 ? "+" : ""}
              {stats.romPct.toFixed(2)}%
            </div>
            <div className="mt-1 text-xs text-white/40">Assumes $100k baseline for mock</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Win Rate</div>
            <div className="mt-1 text-2xl font-semibold">{stats.winRatePct.toFixed(1)}%</div>
            <div className="mt-1 text-xs text-white/40">
              {stats.profitDays} green • {stats.lossDays} red • {stats.flatDays} flat
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Trades</div>
            <div className="mt-1 text-2xl font-semibold">{stats.totalTrades}</div>
            <div className="mt-1 text-xs text-white/40">Total trades this month</div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid grid-cols-7 gap-3 text-xs text-white/50">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-1">{d}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-3">
            {grid.map((cell) => (
              <DayCell key={cell.isoDate} cell={cell} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
