type DraftInput = {
  dateISO: string;               // YYYY-MM-DD
  fundName?: string;             // optional
  weeklyPnl?: number;            // optional
  weeklyRomPct?: number;         // optional
  greenDays?: number;            // optional
  redDays?: number;              // optional
};

function prettyDate(dateISO: string) {
  const d = new Date(dateISO);
  return d.toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });
}

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export function generateWeeklyDraft(input: DraftInput) {
  const d = prettyDate(input.dateISO);

  const titleOptions = [
    "Liquidity, Breadth, and Risk Positioning",
    "Rates Sensitivity and Rotation Dynamics",
    "Volatility Clustering and Regime Signals",
    "Macro Crosscurrents and Market Structure",
  ];

  const title = `${titleOptions[Math.floor(Math.random() * titleOptions.length)]} — Week of ${d}`;

  const tags = "Macro, Volatility, Risk";

  const perfBlock =
    input.weeklyPnl !== undefined
      ? `**Performance snapshot (illustrative):**\n- Weekly P/L: ${money(input.weeklyPnl)}\n- Weekly ROM: ${(input.weeklyRomPct ?? 0).toFixed(2)}%\n- Green/Red days: ${input.greenDays ?? 0}/${input.redDays ?? 0}\n`
      : `**Performance snapshot (illustrative):**\n- Weekly P/L: (placeholder)\n- Weekly ROM: (placeholder)\n- Green/Red days: (placeholder)\n`;

  const fundLine = input.fundName ? `**Fund:** ${input.fundName}\n` : "";

  const body = [
    `This week’s market action reflected a mixed regime: localized strength in index-level pricing while participation and dispersion suggested selective risk-taking.`,
    `We monitor regime signals rather than headlines. When correlations rise and breadth narrows, the priority shifts to controlling drawdowns and maintaining consistent execution.`,
    perfBlock + fundLine,
    `**What we watched:**\n- Breadth and leadership rotation\n- Rates and real yield sensitivity\n- Volatility clustering and correlation shifts\n- Liquidity proxies (credit, funding, cross-asset moves)\n`,
    `**How we think about it (high-level):**\nThe goal is not to predict daily direction. It’s to ensure the portfolio behaves well across regimes, with controlled risk and minimal reliance on one factor or one environment.\n`,
    `**Disclaimer:** This is informational and educational only. It is not investment advice and does not recommend buying or selling any security.`,
  ].join("\n\n");

  return { title, tags, body };
}
