import type { DailyPnl } from "@/lib/calendar/mockDaily";
import { parseISO, format, startOfWeek, endOfWeek, addDays } from "date-fns";

export type WeeklyReview = {
  weekStartISO: string;  // YYYY-MM-DD of Monday
  weekLabel: string;
  totalPnl: number;
  romPct: number;
  trades: number;
  winRatePct: number;
  greenDays: number;
  redDays: number;
};

export function buildWeeklyReviews(daily: DailyPnl[]): WeeklyReview[] {
  const groups = new Map<string, DailyPnl[]>();

  for (const day of daily) {
    // Determine the Monday of the week for this date
    const d = parseISO(day.date);
    // startOfWeek defaults to Sunday (0). We want Monday (1).
    const mon = startOfWeek(d, { weekStartsOn: 1 });
    const key = format(mon, "yyyy-MM-dd");

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(day);
  }

  const result: WeeklyReview[] = [];

  groups.forEach((rows, wkStart) => {
    const totalPnl = rows.reduce((s, r) => s + r.pnl, 0);
    const trades = rows.reduce((s, r) => s + r.trades, 0);
    const greenDays = rows.filter((r) => r.pnl > 0).length;
    const redDays = rows.filter((r) => r.pnl < 0).length;
    
    // Weighted win rate or simple average? Using aggregation:
    // Actually we don't have per-trade outcomes, just daily win rate. 
    // Let's approximate win rate as % of profitable days for the weekly text? 
    // Or just average the daily win rates? 
    // Let's stick to Green Days / Total Days for now or if we had trade-level data.
    // The previous code had `winRatePct = rows.length ? (greenDays / rows.length) * 100 : 0;`
    // But rows has `trades`. Let's assume `trades` is total trades.
    // We don't know how many winning trades in a day without digging into items.
    // Let's just use the mock logic I saw earlier: (Total Green Days / Total Days) * 100 which is weird for "Win Rate" but "Daily Win Rate".
    // Better: Average of daily win rates weighted by trades? No, let's keep it simple.
    // Reverting to previous logic:
    const dailyWinRate = rows.length ? (greenDays / rows.length) * 100 : 0;

    const romPct = (totalPnl / 100000) * 100; // proxy

    const mon = parseISO(wkStart);
    const sun = endOfWeek(mon, { weekStartsOn: 1 });
    
    // Format: "Dec 01 – Dec 07, 2025"
    const label = `${format(mon, "MMM dd")} – ${format(sun, "MMM dd, yyyy")}`;

    result.push({
      weekStartISO: wkStart,
      weekLabel: label,
      totalPnl,
      trades,
      winRatePct: dailyWinRate, 
      greenDays,
      redDays,
      romPct,
    });
  });

  // Sort by date descending (newest first)
  return result.sort((a, b) => b.weekStartISO.localeCompare(a.weekStartISO));
}
