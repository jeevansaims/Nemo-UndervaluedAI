import { MOCK_DAILY } from "@/lib/calendar/mockDaily";
import { buildWeeklyReviews } from "@/lib/review/reviewUtils";

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export default function WeeklyReviewPage() {
  const weeks = buildWeeklyReviews(MOCK_DAILY);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Weekly Review</h1>
        <p className="mt-2 text-sm text-white/60">
          Weekly aggregation for performance reporting and investor-style review.
        </p>

        <div className="mt-6 grid gap-4">
          {weeks.map((w) => (
            <div
              key={w.weekLabel}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{w.weekLabel}</div>
                <div className={`text-lg font-semibold ${w.totalPnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {money(w.totalPnl)}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-5 text-sm">
                <div>
                  <div className="text-white/50">ROM</div>
                  <div>{w.romPct.toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-white/50">Win Rate</div>
                  <div>{w.winRatePct.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-white/50">Trades</div>
                  <div>{w.trades}</div>
                </div>
                <div>
                  <div className="text-white/50">Green Days</div>
                  <div>{w.greenDays}</div>
                </div>
                <div>
                  <div className="text-white/50">Red Days</div>
                  <div>{w.redDays}</div>
                </div>
              </div>

              <div className="mt-3 text-xs text-white/40">
                Weekly systems executed within defined risk limits.
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
