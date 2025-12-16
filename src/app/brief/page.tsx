import Link from "next/link";
import BriefSection from "@/components/brief/BriefSection";
import EmailCapture from "@/components/brief/EmailCapture";
import { buildMockBrief } from "@/lib/brief/mockBrief";

export default function BriefPage() {
  const brief = buildMockBrief();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs text-white/50">Daily</div>
            <h1 className="mt-2 text-3xl font-semibold">Daily Brief</h1>
            <p className="mt-2 text-sm text-white/60">{brief.headline}</p>
          </div>

          <div className="text-xs text-white/50">
            Generated: {new Date(brief.generatedAtISO).toLocaleString()}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {brief.blocks.map((b) => (
            <BriefSection key={b.title} title={b.title} bullets={b.bullets} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Tickers to watch</div>
            <div className="mt-1 text-xs text-white/50">Mock watch notes (no signals)</div>

            <div className="mt-4 space-y-3">
              {brief.topTickers.map((t) => (
                <div key={t.ticker} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{t.ticker}</div>
                    <Link
                      className="text-xs text-white/60 hover:underline"
                      href={`/analysis/${t.ticker}`}
                    >
                      Open analysis →
                    </Link>
                  </div>
                  <div className="mt-2 text-sm text-white/70">{t.note}</div>
                </div>
              ))}
            </div>
          </div>

          <EmailCapture />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">Quick links</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10" href="/funds">
              Funds
            </Link>
            <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10" href="/calendar">
              P/L Calendar
            </Link>
            <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10" href="/insights">
              Weekly Insights
            </Link>
            <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10" href="/alerts">
              Alerts
            </Link>
          </div>

          <div className="mt-4 text-xs text-white/40">
            Disclaimer: informational/educational only — not investment advice.
          </div>
        </div>
      </div>
    </main>
  );
}
