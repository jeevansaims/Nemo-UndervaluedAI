import { computeFundMetricsFromLevels } from "@/lib/metrics/fundMetrics";
import type { SeriesPoint } from "@/lib/metrics/seriesUtils";

export function computeRiskFromCloses(params: {
  closes: Array<{ date: string; close: number }>;
  annualRiskFreeRate?: number;
}) {
  const { closes, annualRiskFreeRate = 0.02 } = params;

  const levels: SeriesPoint[] = closes
    .filter((p) => p?.date && Number.isFinite(p.close))
    .map((p) => ({ date: p.date, value: p.close }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  // Use itself as benchmark (beta/alpha will be 0/0-ish), but we mainly need risk stats.
  // If you want benchmark-relative risk later, pass SPY levels too.
  const m = computeFundMetricsFromLevels({
    portfolioLevels: levels,
    benchmarkLevels: levels,
    annualRiskFreeRate,
  });

  return {
    annualizedVolatilityPct: m.risk.annualized_volatility_pct,
    maxDrawdownPct: m.risk.max_drawdown_pct,
    sharpe: m.risk_adjusted.sharpe_ratio,
    sortino: m.risk_adjusted.sortino_ratio,
    hitRatePct: m.trading_profile.hit_rate_pct,
    bestDayPct: m.trading_profile.best_day_return_pct,
    worstDayPct: m.trading_profile.worst_day_return_pct,
    periodsPerYear: m.performance.periods_per_year,
    samplePeriods: m.performance.days_in_sample,
  };
}
