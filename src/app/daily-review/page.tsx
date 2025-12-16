import { MOCK_DAILY } from "@/lib/calendar/mockDaily";

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export default function DailyReviewPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Daily Review</h1>
        <p className="mt-2 text-sm text-white/60">
          Per-day performance review. Strategy details intentionally hidden.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Fund</th>
                <th className="px-4 py-3 text-right">P/L</th>
                <th className="px-4 py-3 text-right">Trades</th>
                <th className="px-4 py-3 text-right">Win %</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DAILY.map((d) => (
                <tr key={`${d.date}-${d.fund}`} className="border-t border-white/10">
                  <td className="px-4 py-3">{d.date}</td>
                  <td className="px-4 py-3">{d.fund}</td>
                  <td className={`px-4 py-3 text-right ${d.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {money(d.pnl)}
                  </td>
                  <td className="px-4 py-3 text-right">{d.trades}</td>
                  <td className="px-4 py-3 text-right">{d.winRatePct}%</td>
                  <td className="px-4 py-3 text-white/40">
                    Systematic execution. No discretionary override.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
