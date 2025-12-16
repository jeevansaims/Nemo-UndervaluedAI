import type { DailyPnl } from "./mockDaily";

export type CalendarCell = {
  isoDate: string;       // YYYY-MM-DD
  day: number;           // 1..31
  inMonth: boolean;      // in the currently viewed month
  data?: DailyPnl;       // optional daily data
};

export function formatYYYYMM(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

export function parseYYYYMM(yyyymm: string): Date {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildMonthGrid(yyyymm: string, daily: DailyPnl[]): CalendarCell[] {
  const monthStart = parseYYYYMM(yyyymm);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Monday-start calendar (Mon=0..Sun=6)
  const jsDay = firstDayOfMonth.getDay(); // Sun=0..Sat=6
  const mondayIndex = (jsDay + 6) % 7;

  const gridStart = new Date(year, month, 1 - mondayIndex);
  const cells: CalendarCell[] = [];

  const byDate = new Map(daily.map((d) => [d.date, d]));

  // 6 weeks = 42 cells (stable UI)
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);

    const iso = toISODate(d);
    const inMonth = d.getMonth() === month;

    cells.push({
      isoDate: iso,
      day: d.getDate(),
      inMonth,
      data: byDate.get(iso),
    });
  }

  return cells;
}

export function calcMonthStats(yyyymm: string, daily: DailyPnl[]) {
  const monthPrefix = `${yyyymm}-`;
  const rows = daily.filter((d) => d.date.startsWith(monthPrefix));

  const totalPnl = rows.reduce((sum, r) => sum + r.pnl, 0);
  const totalTrades = rows.reduce((sum, r) => sum + r.trades, 0);

  const profitDays = rows.filter((r) => r.pnl > 0).length;
  const lossDays = rows.filter((r) => r.pnl < 0).length;
  const flatDays = rows.filter((r) => r.pnl === 0).length;

  const winRate = rows.length === 0 ? 0 : (profitDays / rows.length) * 100;

  // ROM = Return on Margin (mock now). Later we’ll compute from real capital usage.
  // For Phase 2A mock, we just display pnl as "ROM proxy".
  const romProxyPct = rows.length === 0 ? 0 : (totalPnl / 100000) * 100; // assume 100k base

  return {
    totalPnl,
    totalTrades,
    profitDays,
    lossDays,
    flatDays,
    winRatePct: winRate,
    romPct: romProxyPct,
  };
}
