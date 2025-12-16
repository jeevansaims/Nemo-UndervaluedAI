import { computeFundMetricsFromPerfSeries } from "@/lib/metrics/fundMetrics";
import { fmtPct, fmtNum } from "@/lib/metrics/format";
import { getPerfSeries } from "@/lib/funds/mockPerformance";

export type BriefBlock = {
  title: string;
  bullets: string[];
};

export type DailyBrief = {
  dateISO: string;       // YYYY-MM-DD
  generatedAtISO: string;
  headline: string;
  blocks: BriefBlock[];
  topTickers: { ticker: string; note: string }[];
};

export function buildMockBrief(): DailyBrief {
  const now = new Date();
  const dateISO = now.toISOString().slice(0, 10);

  // Compute metrics for both funds
  const m1 = computeFundMetricsFromPerfSeries({ series: getPerfSeries("original") });
  const m2 = computeFundMetricsFromPerfSeries({ series: getPerfSeries("spx-daily") }); // Used 'spx-daily' based on mockFunds data, previous prompt said 'sp500' but mockFunds has 'spx-daily'

  const fundBlocks = [
    {
      title: "Fund snapshot: Systematic",
      bullets: [
        `Ann: ${fmtPct(m1.performance.annualized_return_pct, 1)} • MaxDD: ${fmtPct(m1.risk.max_drawdown_pct, 1)} • Sharpe: ${fmtNum(m1.risk_adjusted.sharpe_ratio, 2)}`,
        `Vol: ${fmtPct(m1.risk.annualized_volatility_pct, 1)} • Beta: ${fmtNum(m1.relative_to_benchmark.beta, 2)} • Alpha: ${fmtPct(m1.relative_to_benchmark.alpha_annualized_pct, 1)}`,
      ],
    },
    {
      title: "Fund snapshot: SPX Daily",
      bullets: [
        `Ann: ${fmtPct(m2.performance.annualized_return_pct, 1)} • MaxDD: ${fmtPct(m2.risk.max_drawdown_pct, 1)} • Sharpe: ${fmtNum(m2.risk_adjusted.sharpe_ratio, 2)}`,
        `Vol: ${fmtPct(m2.risk.annualized_volatility_pct, 1)} • Beta: ${fmtNum(m2.relative_to_benchmark.beta, 2)} • Alpha: ${fmtPct(m2.relative_to_benchmark.alpha_annualized_pct, 1)}`,
      ],
    },
  ];

  return {
    dateISO,
    generatedAtISO: now.toISOString(),
    headline: "Risk stays selective; watch breadth and volatility clustering.",
    blocks: [
      {
        title: "Market summary",
        bullets: [
          "Index-level strength can mask uneven participation; watch leadership rotation.",
          "When correlations rise, position sizing matters more than prediction.",
          "Focus: drawdown control, consistency, and avoiding regime blind spots.",
        ],
      },
      ...fundBlocks,
      {
        title: "Rates",
        bullets: [
          "Track real yields and rate volatility for equity duration sensitivity.",
          "Watch for policy-driven repricing that shifts risk premia quickly.",
        ],
      },
      {
        title: "Volatility",
        bullets: [
          "Vol clustering often signals positioning shifts and larger tails.",
          "Rising correlation can reduce diversification benefits across risk assets.",
        ],
      },
      {
        title: "Breadth & liquidity",
        bullets: [
          "Narrow breadth increases fragility; confirm moves with participation.",
          "Monitor cross-asset stress (credit, FX, funding proxies).",
        ],
      },
    ],
    topTickers: [
      { ticker: "AAPL", note: "Watch earnings window / implied move risk (mock)." },
      { ticker: "MSFT", note: "Leadership + index sensitivity (mock)." },
      { ticker: "NVDA", note: "Volatility regime + crowding risk (mock)." },
      { ticker: "TSLA", note: "Event-driven tail risk (mock)." },
    ],
  };
}
