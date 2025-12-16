export type SeriesPoint = {
  date: string; // YYYY-MM-DD (or ISO, but must parse via Date)
  value: number;
};

export type ReturnPoint = {
  date: string;
  ret: number; // decimal return (e.g., 0.01 = +1%)
};

/**
 * Sort series ascending by date and drop invalid points.
 */
export function normalizeSeries(points: SeriesPoint[]): SeriesPoint[] {
  return points
    .filter((p) => p && typeof p.value === "number" && Number.isFinite(p.value) && !!p.date)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/**
 * Convert a level series into simple returns: r_t = (V_t / V_{t-1}) - 1
 */
export function computeReturnsFromLevels(levels: SeriesPoint[]): ReturnPoint[] {
  const s = normalizeSeries(levels);
  const out: ReturnPoint[] = [];
  for (let i = 1; i < s.length; i++) {
    const prev = s[i - 1].value;
    const cur = s[i].value;
    if (prev === 0) continue;
    out.push({ date: s[i].date, ret: cur / prev - 1 });
  }
  return out;
}

/**
 * Align multiple series by common dates (inner join).
 * Returns arrays of same length with identical date index.
 */
export function alignByDate<T extends { date: string }>(...series: T[][]): T[][] {
  if (series.length === 0) return [];
  const maps = series.map((arr) => {
    const m = new Map<string, T>();
    for (const p of arr) m.set(p.date, p);
    return m;
  });

  // common dates = intersection
  let common = new Set<string>(maps[0].keys());
  for (let i = 1; i < maps.length; i++) {
    const next = new Set<string>();
    for (const d of common) if (maps[i].has(d)) next.add(d);
    common = next;
  }

  const dates = Array.from(common).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  if (dates.length === 0) {
    throw new Error("Alignment removed all observations. Check that series share dates.");
  }

  return maps.map((m) => dates.map((d) => m.get(d)!).filter(Boolean));
}

/**
 * Estimate periods per year from timestamps.
 * - Uses median day-delta between observations.
 * - Returns a reasonable default when insufficient data.
 */
export function estimatePeriodsPerYear(dates: string[], fallback = 252): number {
  if (!dates || dates.length < 3) return fallback;

  const ms: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const a = new Date(dates[i - 1]).getTime();
    const b = new Date(dates[i]).getTime();
    const delta = b - a;
    if (Number.isFinite(delta) && delta > 0) ms.push(delta);
  }
  if (ms.length < 2) return fallback;

  ms.sort((x, y) => x - y);
  const mid = Math.floor(ms.length / 2);
  const medianMs = ms.length % 2 === 0 ? (ms[mid - 1] + ms[mid]) / 2 : ms[mid];

  const medianDays = medianMs / (1000 * 60 * 60 * 24);

  // Heuristics:
  // ~1 business day -> 252
  // ~7 days -> 52
  // ~30 days -> 12
  // ~90 days -> 4
  if (medianDays <= 2.5) return 252;
  if (medianDays <= 10) return 52;
  if (medianDays <= 45) return 12;
  if (medianDays <= 120) return 4;

  // Very sparse series; treat as annual-ish
  return 1;
}

/**
 * Population stddev (ddof=0), matching numpy/pandas ddof=0 usage in the Python file.
 */
export function stddevPopulation(values: number[]): number {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return 0;

  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const varPop = xs.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / xs.length;
  return Math.sqrt(varPop);
}

/**
 * Population variance (ddof=0).
 */
export function variancePopulation(values: number[]): number {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return 0;

  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return xs.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / xs.length;
}

/**
 * Covariance population (ddof=0) between two equal-length arrays.
 */
export function covariancePopulation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;

  const ax = a.slice(0, n);
  const bx = b.slice(0, n);

  const meanA = ax.reduce((s, v) => s + v, 0) / n;
  const meanB = bx.reduce((s, v) => s + v, 0) / n;

  let cov = 0;
  for (let i = 0; i < n; i++) cov += (ax[i] - meanA) * (bx[i] - meanB);
  return cov / n;
}
