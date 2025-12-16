export type DayTrade = {
  strategyLabel: string;  // will be blurred in UI
  pnl: number;
};

export type DailyPnl = {
  date: string;           // YYYY-MM-DD
  fund: string;           // "Nemo Systematic Fund", "SPX Daily Income Fund"
  pnl: number;            // daily P/L $
  trades: number;         // count
  winRatePct: number;     // 0-100
  items?: DayTrade[];     // drilldown list
};

export const FUNDS = ["All Funds", "Nemo Systematic Fund", "SPX Daily Income Fund"] as const;

export const MOCK_DAILY: DailyPnl[] = [
  {
    date: "2025-12-01",
    fund: "Nemo Systematic Fund",
    pnl: 420,
    trades: 6,
    winRatePct: 66,
    items: [
      { strategyLabel: "Momentum Basket", pnl: 210 },
      { strategyLabel: "Mean Reversion", pnl: 140 },
      { strategyLabel: "Risk Overlay", pnl: 70 },
    ],
  },
  {
    date: "2025-12-02",
    fund: "Nemo Systematic Fund",
    pnl: -180,
    trades: 4,
    winRatePct: 25,
    items: [
      { strategyLabel: "Momentum Basket", pnl: -120 },
      { strategyLabel: "Risk Overlay", pnl: -60 },
    ],
  },
  {
    date: "2025-12-03",
    fund: "SPX Daily Income Fund",
    pnl: 310,
    trades: 5,
    winRatePct: 60,
    items: [
      { strategyLabel: "Index Income", pnl: 220 },
      { strategyLabel: "Hedge", pnl: 90 },
    ],
  },
  {
    date: "2025-12-05",
    fund: "SPX Daily Income Fund",
    pnl: 520,
    trades: 7,
    winRatePct: 71,
    items: [
      { strategyLabel: "Index Income", pnl: 340 },
      { strategyLabel: "Hedge", pnl: 180 },
    ],
  },
  {
    date: "2025-12-11",
    fund: "SPX Daily Income Fund",
    pnl: -260,
    trades: 5,
    winRatePct: 40,
    items: [
      { strategyLabel: "Index Income", pnl: -190 },
      { strategyLabel: "Hedge", pnl: -70 },
    ],
  },
  {
    date: "2025-12-12",
    fund: "Nemo Systematic Fund",
    pnl: 880,
    trades: 9,
    winRatePct: 78,
    items: [
      { strategyLabel: "Momentum Basket", pnl: 520 },
      { strategyLabel: "Mean Reversion", pnl: 260 },
      { strategyLabel: "Risk Overlay", pnl: 100 },
    ],
  },
  {
    date: "2025-12-24",
    fund: "Nemo Systematic Fund",
    pnl: 740,
    trades: 6,
    winRatePct: 83,
    items: [
      { strategyLabel: "Mean Reversion", pnl: 410 },
      { strategyLabel: "Momentum Basket", pnl: 330 },
    ],
  },
  {
    date: "2025-12-31",
    fund: "SPX Daily Income Fund",
    pnl: 910,
    trades: 8,
    winRatePct: 75,
    items: [
      { strategyLabel: "Index Income", pnl: 650 },
      { strategyLabel: "Hedge", pnl: 260 },
    ],
  },
];
