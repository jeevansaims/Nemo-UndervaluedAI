export type AlertType = "INSIDER" | "EARNINGS" | "MACRO" | "SYSTEM";

export type AlertItem = {
  id: string;
  tsISO: string;         // ISO timestamp
  ticker?: string;       // optional for MACRO/SYSTEM
  type: AlertType;
  severity: "LOW" | "MED" | "HIGH";
  title: string;
  details: string;
  sourceLabel?: string;
};

function seedFromString(s: string) {
  let x = 0;
  for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0;
  return x || 1;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, items: T[]): T {
  return items[Math.floor(r() * items.length)];
}

function isoMinutesAgo(minAgo: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minAgo);
  return d.toISOString();
}

export function buildMockAlerts(tickers: string[] = ["AAPL", "MSFT", "NVDA", "TSLA", "SPY"]) {
  const r = mulberry32(seedFromString(tickers.join(",")));
  const out: AlertItem[] = [];

  const types: AlertType[] = ["INSIDER", "EARNINGS", "MACRO", "SYSTEM"];
  const severities: AlertItem["severity"][] = ["LOW", "MED", "HIGH"];

  for (let i = 0; i < 24; i++) {
    const type = pick(r, types);
    const sev = pick(r, severities);
    const ticker = type === "MACRO" || type === "SYSTEM" ? undefined : pick(r, tickers);

    const title =
      type === "INSIDER"
        ? `${ticker}: Insider activity detected (mock)`
        : type === "EARNINGS"
        ? `${ticker}: Earnings / guidance catalyst window (mock)`
        : type === "MACRO"
        ? `Macro: Rates/FX/Vol regime shift watch (mock)`
        : `System: Data freshness / feed status change (mock)`;

    const details =
      type === "INSIDER"
        ? "Insider-related activity flagged by the system (mock). Review filings and context. (No advice)"
        : type === "EARNINGS"
        ? "Earnings window approaching; implied volatility and gap risk may rise. (No advice)"
        : type === "MACRO"
        ? "Cross-asset signals suggest monitoring liquidity and correlations. (No advice)"
        : "Status event related to data freshness and connectivity. (Mock event)";

    out.push({
      id: `${type}-${i}-${Math.floor(r() * 1e9)}`,
      tsISO: isoMinutesAgo(i * 17 + Math.floor(r() * 8)),
      ticker,
      type,
      severity: sev,
      title,
      details,
      sourceLabel: "Nemo Alerts (mock)",
    });
  }

  // newest first
  out.sort((a, b) => (a.tsISO < b.tsISO ? 1 : -1));
  return out;
}
