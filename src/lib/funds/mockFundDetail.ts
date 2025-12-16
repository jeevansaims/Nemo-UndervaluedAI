
export type Position = {
  ticker: string;
  name?: string;
  shares: number;
  value: number;
  weightPct: number;
  dayChangePct: number;
};

export type CashPosition = {
  value: number;
  weightPct: number;
};

export type Trade = {
  id: string;
  date: string;
  side: "Buy" | "Sell";
  ticker: string;
  amount: number; // notional
  pnl?: number;
  thesis: string;
};

export const MOCK_POSITIONS: Position[] = [
  { ticker: "NVDA", name: "NVIDIA Corp", shares: 150, value: 184500, weightPct: 18.5, dayChangePct: 2.4 },
  { ticker: "MSFT", name: "Microsoft", shares: 320, value: 135600, weightPct: 13.6, dayChangePct: -0.5 },
  { ticker: "GOOGL", name: "Alphabet Inc", shares: 400, value: 68000, weightPct: 6.8, dayChangePct: 1.2 },
  { ticker: "META", name: "Meta Platforms", shares: 180, value: 95400, weightPct: 9.5, dayChangePct: 3.1 },
  { ticker: "AMZN", name: "Amazon.com", shares: 500, value: 85000, weightPct: 8.5, dayChangePct: 0.8 },
  { ticker: "AMD", name: "Adv Micro Dev", shares: 600, value: 72000, weightPct: 7.2, dayChangePct: -1.2 },
  { ticker: "TSLA", name: "Tesla Inc", shares: 200, value: 48000, weightPct: 4.8, dayChangePct: 4.5 },
];

export const MOCK_CASH: CashPosition = {
  value: 311500,
  weightPct: 31.1,
};

export const MOCK_TRADES: Trade[] = [
  { id: "t1", date: "2024-12-14", side: "Buy", ticker: "NVDA", amount: 25000, thesis: "Breakout confirmation above key resistance levels with high volume support." },
  { id: "t2", date: "2024-12-13", side: "Sell", ticker: "TSLA", amount: 15000, pnl: 1200, thesis: "Taking partial profits at resistance zone after prolonged rally." },
  { id: "t3", date: "2024-12-12", side: "Buy", ticker: "AMD", amount: 18000, thesis: "Accumulation in support zone ahead of product cycle refresh." },
  { id: "t4", date: "2024-12-10", side: "Sell", ticker: "AAPL", amount: 40000, pnl: -450, thesis: "Rotation out of tech laggards into higher beta semls." },
  { id: "t5", date: "2024-12-08", side: "Buy", ticker: "META", amount: 30000, thesis: "Valuation gap vs peers suggests reversion trade setup." },
];
