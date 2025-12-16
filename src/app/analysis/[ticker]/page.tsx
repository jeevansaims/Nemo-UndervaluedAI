import AnalysisSection from "@/components/analysis/AnalysisSection";
import { use } from "react";
import PriceChart from "@/components/analysis/PriceChart";
import WatchlistButton from "@/components/analysis/WatchlistButton";
import NewsPanel from "@/components/analysis/NewsPanel";

// Force server component to fetch freshly (or use revalidate)
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Helper to format large numbers
const fmtB = (n: number) => (n / 1000).toFixed(1) + "B"; // input usually in millions for Finnhub? No, marketCap is usually in millions.
const fmt = (n: number | null, suffix = "") => (n !== null ? n.toFixed(2) + suffix : "—");

async function getAnalysis(ticker: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/analysis/${ticker}?range=1Y`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function TickerAnalysisPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const data = await getAnalysis(ticker);

  if (!data || data.error) {
    return (
      <main className="min-h-screen p-10 text-white">
        <div>Failed to load analysis for {ticker}</div>
      </main>
    );
  }

  const { profile, quote, fundamentals, risk } = data;

  // Map to existing bullet format
  // We can refine this later to be more structured
  const valuation = [
    `P/E (TTM): ${fmt(fundamentals.peTTM)} • EPS (TTM): ${fmt(fundamentals.epsTTM)}`,
    `P/S (TTM): ${fmt(fundamentals.psTTM)} • P/B: ${fmt(fundamentals.pb)}`,
    `Market Cap: ${profile.marketCap ? fmtB(profile.marketCap) : "—"} (USD)`,
  ];

  const quality = [
    `ROE (TTM): ${fmt(fundamentals.roeTTM, "%")}`,
    `Net Margin (TTM): ${fmt(fundamentals.netMarginTTM, "%")}`,
    `Operating Margin (TTM): ${fmt(fundamentals.operatingMarginTTM, "%")}`,
  ];

  const momentum = [
    `Price: ${quote.price} (${fmt(quote.changePct, "%")})`,
    `52W High: ${fmt(fundamentals["52WeekHigh"])} • Low: ${fmt(fundamentals["52WeekLow"])}`,
    `52W Return: ${fmt(fundamentals["52WeekPriceReturnDaily"], "%")}`,
  ];

  const riskStats = risk
    ? [
        `Vol: ${fmt(risk.annualizedVolatilityPct, "%")} • MaxDD: ${fmt(risk.maxDrawdownPct, "%")}`,
        `Sharpe: ${fmt(risk.sharpe)} • Sortino: ${fmt(risk.sortino)}`,
        `Hit Rate: ${fmt(risk.hitRatePct, "%")} • Best: ${fmt(risk.bestDayPct, "%")} • Worst: ${fmt(risk.worstDayPct, "%")}`,
      ]
    : ["Not enough data to compute risk stats."];

  return (
    <main className="">
      <div className="max-w-6xl px-6 py-10">
        <div className="text-xs text-white/50">Ticker analysis</div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              {profile.logo && <img src={profile.logo} alt="logo" className="h-8 w-8 rounded-full" />}
              {profile.ticker}
            </h1>
            <div className="mt-1 text-sm text-white/60">
              {profile.name} • {profile.exchange}
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-xs text-white/50">
                Industry: {profile.industry}
             </div>
             <WatchlistButton ticker={profile.ticker} />
          </div>
        </div>
        
        <div className="mt-6">
          <PriceChart series={data.priceSeries} />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          This is a real-time analysis based on Finnhub market data.
        </div>
        
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* NewsPanel (still mocked for now, but wired to ticker) */}
          <NewsPanel ticker={profile.ticker} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AnalysisSection title="Valuation" bullets={valuation} />
          <AnalysisSection title="Quality" bullets={quality} />
          <AnalysisSection title="Momentum / Price" bullets={momentum} />
          <AnalysisSection title="Risk Profile" bullets={riskStats} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
          <div className="font-semibold text-white/80">Disclaimer</div>
          <div className="mt-2">
             Data provided by Finnhub. Informational only. Not investment advice.
          </div>
        </div>
      </div>
    </main>
  );
}
