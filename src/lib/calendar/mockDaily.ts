export type DailyPnl = {
  date: string;          // YYYY-MM-DD
  pnl: number;           // daily profit/loss $
  trades: number;        // number of trades
  winRatePct: number;    // 0-100 for that day (optional metric)
};

export const MOCK_DAILY: DailyPnl[] = [
  { date: "2025-12-01", pnl: 420, trades: 6, winRatePct: 66 },
  { date: "2025-12-02", pnl: -180, trades: 4, winRatePct: 25 },
  { date: "2025-12-03", pnl: 310, trades: 5, winRatePct: 60 },
  { date: "2025-12-04", pnl: 0, trades: 0, winRatePct: 0 },
  { date: "2025-12-05", pnl: 520, trades: 7, winRatePct: 71 },
  { date: "2025-12-06", pnl: -90, trades: 2, winRatePct: 50 },
  { date: "2025-12-09", pnl: 260, trades: 3, winRatePct: 67 },
  { date: "2025-12-10", pnl: 140, trades: 2, winRatePct: 50 },
  { date: "2025-12-11", pnl: -260, trades: 5, winRatePct: 40 },
  { date: "2025-12-12", pnl: 880, trades: 9, winRatePct: 78 },
  { date: "2025-12-16", pnl: 190, trades: 2, winRatePct: 50 },
  { date: "2025-12-17", pnl: -120, trades: 3, winRatePct: 33 },
  { date: "2025-12-18", pnl: 350, trades: 4, winRatePct: 75 },
  { date: "2025-12-19", pnl: 610, trades: 6, winRatePct: 67 },
  { date: "2025-12-23", pnl: -310, trades: 4, winRatePct: 25 },
  { date: "2025-12-24", pnl: 740, trades: 6, winRatePct: 83 },
  { date: "2025-12-26", pnl: 220, trades: 2, winRatePct: 50 },
  { date: "2025-12-30", pnl: 520, trades: 5, winRatePct: 80 },
  { date: "2025-12-31", pnl: 910, trades: 8, winRatePct: 75 },
];
