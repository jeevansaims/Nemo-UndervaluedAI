import { MOCK_DAILY } from "@/lib/calendar/mockDaily";
import { buildWeeklyReviews } from "@/lib/review/reviewUtils";
import Link from "next/link";
import { useEffect, useState } from "react";
import PublicModeToggle from "@/components/ui/PublicModeToggle";
import { getPublicMode } from "@/lib/ui/uiStore";
import { fmtMoneyMaybe } from "@/lib/ui/format";

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export default function WeeklyReviewPage() {
  const weeks = buildWeeklyReviews(MOCK_DAILY);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    setIsPublic(getPublicMode());
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-white/50 hover:text-white">
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold">Weekly Performance Review</h1>
          </div>
          <PublicModeToggle />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {weeks.map((wk) => (
            <div
              key={wk.weekLabel}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-white/40">
                  {wk.weekLabel}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <div
                    className={`text-3xl font-bold tracking-tight ${
                      wk.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {fmtMoneyMaybe(wk.totalPnl, isPublic)}
                  </div>
                  <div className="text-sm font-medium text-white/60">
                    {wk.romPct.toFixed(2)}% ROM
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4 text-sm text-white/60">
                  <div>
                    <span className="text-white">
                      {wk.winRatePct.toFixed(0)}%
                    </span>{" "}
                    Win Rate
                  </div>
                  <div>
                    <span className="text-white">{wk.trades}</span> Trades
                  </div>
                </div>

                <div className="mt-2 text-sm text-white/40">
                  <span className="text-emerald-400">{wk.greenDays} Green</span> /{" "}
                  <span className="text-rose-400">{wk.redDays} Red</span>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 text-xs italic text-white/40">
                &ldquo;Generic weekly market note...&rdquo;
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
