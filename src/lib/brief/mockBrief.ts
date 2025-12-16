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
