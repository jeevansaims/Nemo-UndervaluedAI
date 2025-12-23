export type TickerAnalysis = {
  ticker: string;
  name: string;
  summary: string;
  valuation: string[];
  quality: string[];
  momentum: string[];
  risk: string[];
  updatedAtISO: string;
};

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function buildMockAnalysis(tickerRaw: string): TickerAnalysis {
  const ticker = tickerRaw.toUpperCase();

  // placeholder company mapping (we can expand later)
  const nameMap: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    NVDA: "NVIDIA Corporation",
    TSLA: "Tesla, Inc.",
    SPY: "SPDR S&P 500 ETF Trust",
  };

  const name = nameMap[ticker] ?? `${titleCase(ticker)} (Company name TBD)`;

  const updatedAtISO = new Date().toISOString();

  return {
    ticker,
    name,
    summary:
      "This is a high-level, research-style overview. It is not investment advice and does not include trade signals, entries, or exits.",
    valuation: [
      "Compare valuation multiples vs sector/peers (P/E, EV/EBITDA, FCF yield).",
      "Check whether growth expectations justify current pricing (earnings revisions, guidance).",
      "Stress-test downside valuation under higher discount rates.",
    ],
    quality: [
      "Assess profitability durability (gross margin stability, ROIC trend).",
      "Look for balance sheet resilience (net cash/debt, maturity wall).",
      "Evaluate competitive moat signals (pricing power, retention, ecosystem).",
    ],
    momentum: [
      "Review medium-term trend and leadership/relative strength vs benchmark.",
      "Look for regime changes in volatility and correlation.",
      "Watch for clustering of up/down days indicating positioning shifts.",
    ],
    risk: [
      "Macro sensitivity: rates, USD strength, energy inputs, credit conditions.",
      "Idiosyncratic risk: earnings event, regulatory/legal, supply chain.",
      "Liquidity and gap risk: large moves often cluster around catalysts.",
    ],
    updatedAtISO,
  };
}
