import type { Role } from "@/lib/auth/roles";

export type HoldingRow = {
  ticker: string;
  name?: string;
  weightPct?: number | null; // null in PUBLIC
  bucket?: "SMALL" | "MED" | "LARGE"; // used in PUBLIC
  rationale?: string | null; // null in PUBLIC
};

export type TradeRow = {
  ts: number; // unix seconds
  ticker: string;
  action: "BUY" | "SELL";
  qty?: number | null;       // null in PUBLIC
  price?: number | null;     // null in PUBLIC
  rationale?: string | null; // null in PUBLIC
};

export function canViewPrivate(role: Role): boolean {
  return role === "USER" || role === "ADMIN";
}

/**
 * Convert numeric weights into coarse buckets for public display.
 * Tune thresholds whenever you want.
 */
export function weightToBucket(weightPct: number): "SMALL" | "MED" | "LARGE" {
  if (weightPct >= 12) return "LARGE";
  if (weightPct >= 5) return "MED";
  return "SMALL";
}

export function redactHoldings(rows: HoldingRow[], role: Role): HoldingRow[] {
  if (canViewPrivate(role)) return rows;

  return rows.map((h) => {
    const w = typeof h.weightPct === "number" ? h.weightPct : 0;
    return {
      ticker: h.ticker,
      name: h.name,
      weightPct: null,
      bucket: weightToBucket(w),
      rationale: null,
    };
  });
}

export function redactTrades(rows: TradeRow[], role: Role): TradeRow[] {
  if (canViewPrivate(role)) return rows;

  return rows.map((t) => ({
    ts: t.ts,
    ticker: t.ticker,
    action: t.action,
    qty: null,
    price: null,
    rationale: null,
  }));
}
