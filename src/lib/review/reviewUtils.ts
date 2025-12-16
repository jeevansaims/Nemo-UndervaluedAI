import type { DailyPnl } from "@/lib/calendar/mockDaily";

export type WeeklyReview = {
  weekStartISO: string;  // NEW
  weekLabel: string;
  totalPnl: number;
  romPct: number;
  trades: number;
  winRatePct: number;
  greenDays: number;
  redDays: number;
};

function startOfWeek(d: Date) {
  const day = d.getDay(); // Sun=0
// ... existing code ...
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
        weekStartISO: wkStart,
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
