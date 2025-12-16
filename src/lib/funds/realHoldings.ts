export type Holding = { ticker: string; weight: number };

export function getFundHoldings(slug: string): Holding[] {
  // Replace with your real systematic holdings logic later.
  if (slug === "systematic" || slug === "original") {
    return [
      { ticker: "MSFT", weight: 0.20 },
      { ticker: "AAPL", weight: 0.20 },
      { ticker: "NVDA", weight: 0.20 },
      { ticker: "AMZN", weight: 0.20 },
      { ticker: "GOOGL", weight: 0.20 },
    ];
  }

  if (slug === "spx-daily" || slug === "sp500") {
    return [
      { ticker: "SPY", weight: 1.0 },
    ];
  }

  // default: benchmark-like
  return [{ ticker: "SPY", weight: 1.0 }];
}

export function normalizeWeights(holdings: Holding[]): Holding[] {
  const sum = holdings.reduce((a, h) => a + h.weight, 0);
  if (sum <= 0) return holdings;
  return holdings.map((h) => ({ ...h, weight: h.weight / sum }));
}
