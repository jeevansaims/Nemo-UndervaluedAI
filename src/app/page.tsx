import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-xs text-white/50">Nemo-UndervaluedAI</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          NemoTrades Performance Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/60">
          Public-facing performance reporting. Strategies intentionally undisclosed.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/funds"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">Funds</div>
            <div className="mt-1 text-sm text-white/60">Overview + fund detail pages</div>
          </Link>

          <Link
            href="/calendar"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">P/L Calendar</div>
            <div className="mt-1 text-sm text-white/60">Daily results + drilldown</div>
          </Link>

          <Link
            href="/insights"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">Insights</div>
            <div className="mt-1 text-sm text-white/60">Weekly market notes</div>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
          Disclaimer: informational/educational only — not investment advice.
        </div>
      </div>
    </main>
  );
}
