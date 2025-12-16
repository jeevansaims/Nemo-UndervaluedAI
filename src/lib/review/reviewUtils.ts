import type { DailyPnl } from "@/lib/calendar/mockDaily";

export type WeeklyReview = {
  weekLabel: string;     // e.g. "Dec 09 – Dec 13, 2025"
  totalPnl: number;
  romPct: number;
  trades: number;
  winRatePct: number;
  greenDays: number;
  redDays: number;
};

function startOfWeek(d: Date) {
  const day = d.getDay(); // Sun=0
  const diff = (day === 0 ? -6 : 1) - day;
  const out = new Date(d);
  out.setDate(d.getDate() + diff);
  return out;
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function buildWeeklyReviews(daily: DailyPnl[]): WeeklyReview[] {
  const byWeek = new Map<string, DailyPnl[]>();

  daily.forEach((d) => {
    const dt = new Date(d.date);
    const wk = toISO(startOfWeek(dt));
    if (!byWeek.has(wk)) byWeek.set(wk, []);
    byWeek.get(wk)!.push(d);
  });

  return Array.from(byWeek.entries())
    .map(([wkStart, rows]) => {
      const totalPnl = rows.reduce((s, r) => s + r.pnl, 0);
      const trades = rows.reduce((s, r) => s + r.trades, 0);
      const greenDays = rows.filter((r) => r.pnl > 0).length;
      const redDays = rows.filter((r) => r.pnl < 0).length;
      const winRatePct = rows.length ? (greenDays / rows.length) * 100 : 0;
      const romPct = (totalPnl / 100000) * 100; // proxy

      const start = new Date(wkStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 4);

      const label = `${start.toLocaleDateString(undefined, { month: "short", day: "2-digit" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })}`;

      return {
        weekLabel: label,
        totalPnl,
        trades,
        winRatePct,
        greenDays,
        redDays,
        romPct,
      };
    })
    .sort((a, b) => b.weekLabel.localeCompare(a.weekLabel));
}
