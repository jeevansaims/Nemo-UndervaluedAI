export type WeeklyMetricsInput = {
  dateISO: string;         // date for title (we'll pass weekStartISO)
  fundName: string;        // chosen fund filter
  weekLabel: string;
  weeklyPnl: number;
  weeklyRomPct: number;
  trades: number;
  greenDays: number;
  redDays: number;
};

function prettyDate(dateISO: string) {
  const d = new Date(dateISO);
  return d.toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });
}

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export function generateWeeklyDraftFromMetrics(input: WeeklyMetricsInput) {
  const d = prettyDate(input.dateISO);

  const titleOptions = [
    "Liquidity, Breadth, and Risk Positioning",
    "Rates Sensitivity and Rotation Dynamics",
    "Volatility Clustering and Regime Signals",
    "Macro Crosscurrents and Market Structure",
  ];

  const title = `${titleOptions[Math.floor(Math.random() * titleOptions.length)]} — ${input.weekLabel}`;

  const tags = "Macro, Volatility, Risk";

  const body = [
    `This note summarizes observable market conditions and the portfolio’s week-level outcome. It is designed for transparency and education, not trade instruction.`,
    ``,
    `**Reporting scope:** ${input.fundName}`,
    `**Week:** ${input.weekLabel}`,
    ``,
    `**Performance snapshot:**`,
    `- Weekly P/L: ${money(input.weeklyPnl)}`,
    `- Weekly ROM: ${input.weeklyRomPct.toFixed(2)}%`,
    `- Trades: ${input.trades}`,
    `- Green/Red days: ${input.greenDays}/${input.redDays}`,
    ``,
    `**Market structure (high-level):**`,
    `- Monitor breadth and leadership rotation`,
    `- Watch rate sensitivity / real yield pressure`,
    `- Track volatility clustering and correlation shifts`,
    `- Use liquidity proxies to avoid regime blind spots`,
    ``,
    `**Risk framing:**`,
    `The goal is consistency and drawdown control across regimes, rather than maximizing a single-week outcome.`,
    ``,
    `**Disclaimer:** This is informational and educational only. It is not investment advice and does not recommend buying or selling any security.`,
  ].join("\n");

  return { title, tags, body };
}
