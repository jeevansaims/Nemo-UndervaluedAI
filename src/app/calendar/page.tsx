```
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import DayCell from "@/components/calendar/DayCell";
import DayModal from "@/components/calendar/DayModal";
import PublicModeToggle from "@/components/ui/PublicModeToggle";
import { FUNDS, MOCK_DAILY, type DailyPnl } from "@/lib/calendar/mockDaily";
import { buildMonthGrid, calcMonthStats, filterDailyByFund, formatYYYYMM, getDayByIso, parseYYYYMM } from "@/lib/calendar/calendarUtils";
import { getPublicMode } from "@/lib/ui/uiStore";
import { fmtMoneyMaybe } from "@/lib/ui/format";

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
  const [fund, setFund] = useState("All Funds");
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(true); // Default safe

  useEffect(() => {
    setIsPublic(getPublicMode());
  }, []);

  const filteredDaily = useMemo(() => filterDailyByFund(MOCK_DAILY, fund), [fund]);
  const grid = useMemo(() => buildMonthGrid(yyyymm, filteredDaily), [yyyymm, filteredDaily]);
  const stats = useMemo(() => calcMonthStats(yyyymm, filteredDaily), [yyyymm, filteredDaily]);

  const selectedDay = useMemo(() => {
    if (!selectedIso) return undefined;
    return getDayByIso(filteredDaily, selectedIso);
  }, [filteredDaily, selectedIso]);

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

          <div className="flex flex-wrap items-center gap-3">
            <PublicModeToggle />
            
            <select
              value={fund}
              onChange={(e) => setFund(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {FUNDS.map((f) => (
                <option key={f} value={f} className="bg-neutral-900">
                  {f}
                </option>
              ))}
            </select>
            
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
          <div className="flex items-baseline gap-1">
          <div className="text-sm font-semibold text-white/40">Total P/L</div>
          <div
            className={`text-xl font-bold ${
              stats.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {fmtMoneyMaybe(stats.totalPnl, isPublic)}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-sm font-semibold text-white/40">ROM</div>
          <div className="text-xl font-bold text-white">
            {stats.romPct >= 0 ? "+" : ""}
            {stats.romPct.toFixed(2)}%
          </div>
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
              <DayCell
                key={cell.isoDate}
                cell={cell}
                isPublic={isPublic}
                onClick={(iso) => {
                  setSelectedIso(iso);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        <DayModal
          open={modalOpen}
          day={selectedDay}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </main>
  );
}
