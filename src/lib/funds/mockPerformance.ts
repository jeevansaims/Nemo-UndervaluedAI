export type PerfPoint = {
  date: string;          // YYYY-MM-DD
  fundPct: number;       // cumulative return %
  benchPct: number;      // cumulative return %
  fundValue?: number;    // optional (private mode)
  benchValue?: number;   // optional (private mode)
};

export const MOCK_PERF: Record<string, PerfPoint[]> = {
  original: [
    { date: "2025-01-02", fundPct: 0.0, benchPct: 0.0, fundValue: 100000, benchValue: 100000 },
    { date: "2025-02-03", fundPct: 1.8, benchPct: 1.2, fundValue: 101800, benchValue: 101200 },
    { date: "2025-03-03", fundPct: 3.1, benchPct: 2.4, fundValue: 103100, benchValue: 102400 },
    { date: "2025-04-01", fundPct: 2.2, benchPct: 2.9, fundValue: 102200, benchValue: 102900 },
    { date: "2025-05-01", fundPct: 4.9, benchPct: 4.0, fundValue: 104900, benchValue: 104000 },
    { date: "2025-06-02", fundPct: 6.0, benchPct: 5.1, fundValue: 106000, benchValue: 105100 },
    { date: "2025-07-01", fundPct: 7.4, benchPct: 6.3, fundValue: 107400, benchValue: 106300 },
    { date: "2025-08-01", fundPct: 6.8, benchPct: 6.6, fundValue: 106800, benchValue: 106600 },
    { date: "2025-09-02", fundPct: 9.2, benchPct: 7.9, fundValue: 109200, benchValue: 107900 },
    { date: "2025-10-01", fundPct: 10.5, benchPct: 9.1, fundValue: 110500, benchValue: 109100 },
    { date: "2025-11-03", fundPct: 12.1, benchPct: 10.2, fundValue: 112100, benchValue: 110200 },
    { date: "2025-12-01", fundPct: 13.4, benchPct: 11.6, fundValue: 113400, benchValue: 111600 },
  ],

  sp500: [
    { date: "2025-01-02", fundPct: 0.0, benchPct: 0.0, fundValue: 100000, benchValue: 100000 },
    { date: "2025-02-03", fundPct: 1.1, benchPct: 1.2, fundValue: 101100, benchValue: 101200 },
    { date: "2025-03-03", fundPct: 2.8, benchPct: 2.4, fundValue: 102800, benchValue: 102400 },
    { date: "2025-04-01", fundPct: 2.2, benchPct: 2.9, fundValue: 102200, benchValue: 102900 },
    { date: "2025-05-01", fundPct: 3.7, benchPct: 4.0, fundValue: 103700, benchValue: 104000 },
    { date: "2025-06-02", fundPct: 5.0, benchPct: 5.1, fundValue: 105000, benchValue: 105100 },
    { date: "2025-07-01", fundPct: 6.2, benchPct: 6.3, fundValue: 106200, benchValue: 106300 },
    { date: "2025-08-01", fundPct: 6.5, benchPct: 6.6, fundValue: 106500, benchValue: 106600 },
    { date: "2025-09-02", fundPct: 7.2, benchPct: 7.9, fundValue: 107200, benchValue: 107900 },
    { date: "2025-10-01", fundPct: 8.9, benchPct: 9.1, fundValue: 108900, benchValue: 109100 },
    { date: "2025-11-03", fundPct: 10.0, benchPct: 10.2, fundValue: 110000, benchValue: 110200 },
    { date: "2025-12-01", fundPct: 11.2, benchPct: 11.6, fundValue: 111200, benchValue: 111600 },
  ],
};

export function getPerfSeries(slug: string) {
  return MOCK_PERF[slug] ?? MOCK_PERF["original"];
}
