import type { HoldingRow, TradeRow } from "@/lib/funds/fundAccess";

type FundPrivateData = {
  holdings: HoldingRow[];
  trades: TradeRow[];
};

const now = Math.floor(Date.now() / 1000);

const FUND_DATA: Record<string, FundPrivateData> = {
  // Support your aliases
  original: {
    holdings: [
      { ticker: "MSFT", name: "Microsoft", weightPct: 20, rationale: "Strong cashflows + durable moat." },
      { ticker: "AAPL", name: "Apple", weightPct: 20, rationale: "Capital return + ecosystem lock-in." },
      { ticker: "NVDA", name: "NVIDIA", weightPct: 20, rationale: "AI compute leader; strong momentum + margins." },
      { ticker: "AMZN", name: "Amazon", weightPct: 20, rationale: "AWS leverage + retail efficiency improvements." },
      { ticker: "GOOGL", name: "Alphabet", weightPct: 20, rationale: "Search + cloud + optionality; valuation reasonable." },
    ],
    trades: [
      { ts: now - 86400 * 2, ticker: "NVDA", action: "BUY", qty: 10, price: 130.25, rationale: "Added on pullback after earnings." },
      { ts: now - 86400 * 7, ticker: "AAPL", action: "SELL", qty: 5, price: 195.10, rationale: "Trim into strength; rebalance weights." },
    ],
  },

  sp500: {
    holdings: [{ ticker: "SPY", name: "SPDR S&P 500 ETF", weightPct: 100, rationale: "Benchmark exposure." }],
    trades: [{ ts: now - 86400 * 1, ticker: "SPY", action: "BUY", qty: 2, price: 540.12, rationale: "Rebalanced to target exposure." }],
  },

  // Your newer names
  systematic: undefined as any,
  "spx-daily": undefined as any,
};

// Alias mapping (so /funds/systematic works)
FUND_DATA.systematic = FUND_DATA.original;
FUND_DATA["spx-daily"] = FUND_DATA.sp500;

export function getPrivateFundData(slug: string): FundPrivateData {
  const key = slug.toLowerCase();
  const data = FUND_DATA[key];
  if (!data) {
    // Default fallback: empty but valid
    return { holdings: [], trades: [] };
  }
  return data;
}
