import {
  alignByDate,
  computeReturnsFromLevels,
  covariancePopulation,
  estimatePeriodsPerYear,
  SeriesPoint,
  stddevPopulation,
  variancePopulation,
  type ReturnPoint,
} from "@/lib/metrics/seriesUtils";

/**
 * Mirrors Undervalued-ai fund_metrics.py, but:
 * - implemented in TypeScript
 * - frequency-aware (periodsPerYear inferred from dates)
 *
 * All *_pct fields are DECIMALS (0.12 = 12%), matching the Python convention.
 */

export type FundMetrics = {
  performance: {
    cumulative_return_pct: number;
    annualized_return_pct: number;
    benchmark_annualized_return_pct: number;
    excess_annualized_return_pct: number;
    periods_per_year: number;
    days_in_sample: number; // kept name for compatibility; really "periods in sample"
  };
  risk: {
    annualized_volatility_pct: number;
    max_drawdown_pct: number;
    downside_deviation_pct: number;
  };
  risk_adjusted: {
    sharpe_ratio: number | null;
    sortino_ratio: number | null;
  };
  relative_to_benchmark: {
    beta: number;
    alpha_annualized_pct: number;
    tracking_error_pct: number;
    information_ratio: number | null;
  };
  trading_profile: {
    hit_rate_pct: number;
    best_day_return_pct: number;
    worst_day_return_pct: number;
  };
};

function productOnePlus(returns: number[]): number {
  let acc = 1.0;
  for (const r of returns) acc *= 1.0 + r;
  return acc;
}

export function computeMaxDrawdownPct(levels: SeriesPoint[]): number {
  const s = levels.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  if (s.length === 0) return 0;

  let peak = s[0].value;
  let maxDD = 0; // drawdowns are negative; min drawdown is most negative
  for (const p of s) {
    peak = Math.max(peak, p.value);
    if (peak === 0) continue;
    const dd = p.value / peak - 1.0;
    if (dd < maxDD) maxDD = dd;
  }
  return maxDD;
}

export function computeCumulativeReturnPct(fundReturns: ReturnPoint[]): number {
  if (fundReturns.length === 0) return 0;
  const growth = productOnePlus(fundReturns.map((x) => x.ret));
  return growth - 1.0;
}

export function computeAnnualizedReturnPct(fundReturns: ReturnPoint[], periodsPerYear: number): number {
  if (fundReturns.length === 0) return 0;
  const growth = productOnePlus(fundReturns.map((x) => x.ret));
  const years = fundReturns.length / periodsPerYear;
  if (years <= 0) return 0;
  return Math.pow(growth, 1.0 / years) - 1.0;
}

export function computeAnnualizedVolatilityPct(fundReturns: ReturnPoint[], periodsPerYear: number): number {
  if (fundReturns.length === 0) return 0;
  const sd = stddevPopulation(fundReturns.map((x) => x.ret));
  return sd * Math.sqrt(periodsPerYear);
}

export function computeDownsideDeviationPct(
  fundReturns: ReturnPoint[],
  riskFreeReturns: ReturnPoint[],
  periodsPerYear: number
): number {
  const [f, rf] = alignByDate(fundReturns, riskFreeReturns) as [ReturnPoint[], ReturnPoint[]];
  const negExcess = f
    .map((p, i) => p.ret - rf[i].ret)
    .filter((x) => x < 0);

  if (negExcess.length === 0) return 0;
  const sd = stddevPopulation(negExcess);
  return sd * Math.sqrt(periodsPerYear);
}

export function computeSharpeRatio(
  fundReturns: ReturnPoint[],
  riskFreeReturns: ReturnPoint[],
  periodsPerYear: number
): number | null {
  const [f, rf] = alignByDate(fundReturns, riskFreeReturns) as [ReturnPoint[], ReturnPoint[]];
  const excess = f.map((p, i) => p.ret - rf[i].ret);
  if (excess.length === 0) return null;

  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const sd = stddevPopulation(excess);
  if (sd === 0) return null;

  const annMean = mean * periodsPerYear;
  const annVol = sd * Math.sqrt(periodsPerYear);
  return annMean / annVol;
}

export function computeSortinoRatio(
  fundReturns: ReturnPoint[],
  riskFreeReturns: ReturnPoint[],
  periodsPerYear: number
): number | null {
  const [f, rf] = alignByDate(fundReturns, riskFreeReturns) as [ReturnPoint[], ReturnPoint[]];
  const excess = f.map((p, i) => p.ret - rf[i].ret);
  if (excess.length === 0) return null;

  const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const annMean = mean * periodsPerYear;

  const downside = computeDownsideDeviationPct(fundReturns, riskFreeReturns, periodsPerYear);
  if (downside === 0) return null;

  return annMean / downside;
}

export function computeTrackingErrorPct(
  fundReturns: ReturnPoint[],
  benchmarkReturns: ReturnPoint[],
  periodsPerYear: number
): number {
  const [f, b] = alignByDate(fundReturns, benchmarkReturns) as [ReturnPoint[], ReturnPoint[]];
  const active = f.map((p, i) => p.ret - b[i].ret);
  if (active.length === 0) return 0;

  const sd = stddevPopulation(active);
  return sd * Math.sqrt(periodsPerYear);
}

export function computeInformationRatio(
  fundReturns: ReturnPoint[],
  benchmarkReturns: ReturnPoint[],
  periodsPerYear: number
): number | null {
  const [f, b] = alignByDate(fundReturns, benchmarkReturns) as [ReturnPoint[], ReturnPoint[]];
  const active = f.map((p, i) => p.ret - b[i].ret);
  if (active.length === 0) return null;

  const mean = active.reduce((a, c) => a + c, 0) / active.length;
  const sd = stddevPopulation(active);
  if (sd === 0) return null;

  const annMean = mean * periodsPerYear;
  const annTE = sd * Math.sqrt(periodsPerYear);
  return annMean / annTE;
}

export function computeBetaAndAlphaPct(
  fundReturns: ReturnPoint[],
  benchmarkReturns: ReturnPoint[],
  riskFreeReturns: ReturnPoint[],
  periodsPerYear: number
): { beta: number; alpha_annualized_pct: number } {
  const [f, b, rf] = alignByDate(fundReturns, benchmarkReturns, riskFreeReturns) as [
    ReturnPoint[],
    ReturnPoint[],
    ReturnPoint[]
  ];

  const excessFund = f.map((p, i) => p.ret - rf[i].ret);
  const excessBench = b.map((p, i) => p.ret - rf[i].ret);

  const benchVar = variancePopulation(excessBench);
  const beta = benchVar === 0 ? 0 : covariancePopulation(excessFund, excessBench) / benchVar;

  const meanExFund = excessFund.reduce((a, c) => a + c, 0) / excessFund.length;
  const meanExBench = excessBench.reduce((a, c) => a + c, 0) / excessBench.length;

  const dailyAlpha = meanExFund - beta * meanExBench;
  const alphaAnnual = dailyAlpha * periodsPerYear;

  return { beta, alpha_annualized_pct: alphaAnnual };
}

export function computeHitRatePct(fundReturns: ReturnPoint[]): number {
  if (fundReturns.length === 0) return 0;
  const wins = fundReturns.filter((x) => x.ret > 0).length;
  return wins / fundReturns.length;
}

export function computeBestDayReturnPct(fundReturns: ReturnPoint[]): number {
  if (fundReturns.length === 0) return 0;
  return Math.max(...fundReturns.map((x) => x.ret));
}

export function computeWorstDayReturnPct(fundReturns: ReturnPoint[]): number {
  if (fundReturns.length === 0) return 0;
  return Math.min(...fundReturns.map((x) => x.ret));
}

/**
 * Build a flat risk-free return series aligned to the fund series dates.
 * If you later have a real RF series, pass it in and skip this.
 */
export function buildFlatRiskFreeReturns(
  dates: string[],
  annualRiskFreeRate = 0.02,
  periodsPerYear = 252
): ReturnPoint[] {
  // Convert annual RF to per-period return
  const perPeriod = Math.pow(1 + annualRiskFreeRate, 1 / periodsPerYear) - 1;
  return dates.map((d) => ({ date: d, ret: perPeriod }));
}

/**
 * High-level aggregator: consumes LEVEL series for fund & benchmark.
 * Returns metrics grouped similarly to Python.
 */
export function computeFundMetricsFromLevels(params: {
  portfolioLevels: SeriesPoint[];
  benchmarkLevels: SeriesPoint[];
  // Either pass riskFreeReturns (ReturnPoint[]) or let it build flat RF.
  riskFreeReturns?: ReturnPoint[];
  annualRiskFreeRate?: number; // used only if riskFreeReturns not provided
}): FundMetrics {
  const portfolio = params.portfolioLevels.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const benchmark = params.benchmarkLevels.slice().sort((a, b) => (a.date < b.date ? -1 : 1));

  const fundReturns = computeReturnsFromLevels(portfolio);
  const benchmarkReturns = computeReturnsFromLevels(benchmark);

  const periodsPerYear = estimatePeriodsPerYear(fundReturns.map((p) => p.date), 252);

  const riskFree =
    params.riskFreeReturns ??
    buildFlatRiskFreeReturns(
      fundReturns.map((p) => p.date),
      params.annualRiskFreeRate ?? 0.02,
      periodsPerYear
    );

  // Performance
  const cumulative_return_pct = computeCumulativeReturnPct(fundReturns);
  const annualized_return_pct = computeAnnualizedReturnPct(fundReturns, periodsPerYear);
  const benchmark_annualized_return_pct = computeAnnualizedReturnPct(benchmarkReturns, periodsPerYear);
  const excess_annualized_return_pct = annualized_return_pct - benchmark_annualized_return_pct;

  // Risk
  const annualized_volatility_pct = computeAnnualizedVolatilityPct(fundReturns, periodsPerYear);
  const max_drawdown_pct = computeMaxDrawdownPct(portfolio);
  const downside_deviation_pct = computeDownsideDeviationPct(fundReturns, riskFree, periodsPerYear);

  // Risk-adjusted
  const sharpe_ratio = computeSharpeRatio(fundReturns, riskFree, periodsPerYear);
  const sortino_ratio = computeSortinoRatio(fundReturns, riskFree, periodsPerYear);

  // Benchmark-relative
  const tracking_error_pct = computeTrackingErrorPct(fundReturns, benchmarkReturns, periodsPerYear);
  const information_ratio = computeInformationRatio(fundReturns, benchmarkReturns, periodsPerYear);
  const { beta, alpha_annualized_pct } = computeBetaAndAlphaPct(
    fundReturns,
    benchmarkReturns,
    riskFree,
    periodsPerYear
  );

  // Trading profile
  const hit_rate_pct = computeHitRatePct(fundReturns);
  const best_day_return_pct = computeBestDayReturnPct(fundReturns);
  const worst_day_return_pct = computeWorstDayReturnPct(fundReturns);

  const days_in_sample = fundReturns.length;

  return {
    performance: {
      cumulative_return_pct,
      annualized_return_pct,
      benchmark_annualized_return_pct,
      excess_annualized_return_pct,
      periods_per_year: periodsPerYear,
      days_in_sample,
    },
    risk: {
      annualized_volatility_pct,
      max_drawdown_pct,
      downside_deviation_pct,
    },
    risk_adjusted: {
      sharpe_ratio,
      sortino_ratio,
    },
    relative_to_benchmark: {
      beta,
      alpha_annualized_pct,
      tracking_error_pct,
      information_ratio,
    },
    trading_profile: {
      hit_rate_pct,
      best_day_return_pct,
      worst_day_return_pct,
    },
  };
}

/**
 * Convenience: compute metrics directly from your PerfPoint[] series.
 * Expects:
 * - fundPct and benchPct are cumulative (%) decimals? In your app they are "percent points" (e.g. 12.3).
 * We will convert to LEVEL series safely in a consistent way.
 *
 * Best practice: use fundValue/benchValue if present (private mode).
 * Otherwise, synthesize levels from fundPct/benchPct assuming base=100.
 */
export function computeFundMetricsFromPerfSeries(params: {
  series: Array<{
    date: string;
    fundPct: number;
    benchPct: number;
    fundValue?: number;
    benchValue?: number;
  }>;
  annualRiskFreeRate?: number;
}): FundMetrics {
  const s = params.series.slice().sort((a, b) => (a.date < b.date ? -1 : 1));

  // Prefer real dollar levels if present; else synthesize with base=100 from pct series
  const haveMoney = s.every((p) => typeof p.fundValue === "number" && typeof p.benchValue === "number");

  const portfolioLevels: SeriesPoint[] = s.map((p) => ({
    date: p.date,
    value: haveMoney ? (p.fundValue as number) : 100 * (1 + p.fundPct / 100),
  }));

  const benchmarkLevels: SeriesPoint[] = s.map((p) => ({
    date: p.date,
    value: haveMoney ? (p.benchValue as number) : 100 * (1 + p.benchPct / 100),
  }));

  return computeFundMetricsFromLevels({
    portfolioLevels,
    benchmarkLevels,
    annualRiskFreeRate: params.annualRiskFreeRate ?? 0.02,
  });
}
