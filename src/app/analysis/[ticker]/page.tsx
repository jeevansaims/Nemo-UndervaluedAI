import AnalysisSection from "@/components/analysis/AnalysisSection";
import { buildMockAnalysis } from "@/lib/analysis/mockTickerAnalysis";
import { use } from "react";

export default function TickerAnalysisPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const a = buildMockAnalysis(ticker);

  return (
    <main className="">
      <div className="max-w-6xl px-6 py-10">
        <div className="text-xs text-white/50">Ticker analysis</div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{a.ticker}</h1>
            <div className="mt-1 text-sm text-white/60">{a.name}</div>
          </div>

          <div className="text-xs text-white/50">
            Updated: {new Date(a.updatedAtISO).toLocaleString()}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          {a.summary}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AnalysisSection title="Valuation" bullets={a.valuation} />
          <AnalysisSection title="Quality" bullets={a.quality} />
          <AnalysisSection title="Momentum" bullets={a.momentum} />
          <AnalysisSection title="Risk" bullets={a.risk} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
          <div className="font-semibold text-white/80">Disclaimer</div>
          <div className="mt-2">
            Informational and educational only. Not investment advice. No recommendation to buy/sell.
          </div>
        </div>
      </div>
    </main>
  );
}
