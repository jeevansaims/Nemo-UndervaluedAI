export type Fund = {
  slug: string;
  name: string;
  description: string;

  daysActive: number;
  trades: number;

  fundReturnPct: number;
  benchmarkName: string;
  benchmarkReturnPct: number;
  excessReturnPct: number;

  maxDrawdownPct: number;
  winRatePct: number;
};

export const MOCK_FUNDS: Fund[] = [
  {
    slug: "original",
    name: "Nemo Systematic Fund",
    description: "Multi-system quantitative portfolio. Strategy details intentionally hidden.",
    daysActive: 212,
    trades: 384,
    fundReturnPct: 31.6,
    benchmarkName: "S&P 500",
    benchmarkReturnPct: 16.8,
    excessReturnPct: 14.8,
    maxDrawdownPct: -9.2,
    winRatePct: 55.4,
  },
  {
    slug: "spx-daily",
    name: "SPX Daily Income Fund",
    description: "Short-duration index strategies with controlled drawdowns.",
    daysActive: 146,
    trades: 512,
    fundReturnPct: 24.1,
    benchmarkName: "S&P 500",
    benchmarkReturnPct: 12.5,
    excessReturnPct: 11.6,
    maxDrawdownPct: -7.1,
    winRatePct: 57.9,
  },
];

export function getFundBySlug(slug: string): Fund | undefined {
  return MOCK_FUNDS.find((f) => f.slug === slug);
}
