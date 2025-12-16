export type InsightPost = {
  slug: string;
  date: string;      // YYYY-MM-DD
  title: string;
  excerpt: string;
  body: string[];    // paragraphs
  tags?: string[];
};

export const MOCK_INSIGHTS: InsightPost[] = [
  {
    slug: "liquidity-stress-narrow-breadth",
    date: "2025-12-11",
    title: "Liquidity Tightness and Narrowing Breadth",
    excerpt:
      "Market breadth narrowed as funding conditions stayed restrictive. Risk appetite rotated toward defensives while cyclicals lagged.",
    body: [
      "This week’s tape showed signs of narrowing breadth: fewer stocks contributed to index-level gains while dispersion increased.",
      "In this environment, headline indices can appear stable even while underlying participation deteriorates. That typically raises the importance of risk controls and position sizing.",
      "We monitor liquidity proxies (rates volatility, credit spreads, and cross-asset correlations) and reduce exposure when regime signals imply elevated tail risk.",
      "This commentary is informational only and does not represent investment advice or a recommendation to buy or sell any security.",
    ],
    tags: ["Liquidity", "Breadth", "Risk"],
  },
  {
    slug: "treasury-absorption-crowding-out",
    date: "2025-12-04",
    title: "Treasury Absorption and Private Capital Crowding",
    excerpt:
      "Large sovereign issuance can change marginal demand for risk assets. We summarize observable signals and what we monitor next.",
    body: [
      "Sustained issuance can affect portfolio behavior as global capital reallocates across duration, cash, and risk assets.",
      "We pay close attention to auction dynamics, real yields, and the correlation structure between equities and rates.",
      "When correlations rise, diversification benefits can weaken. That’s when systematic risk overlays tend to matter more.",
      "This is a high-level research note intended for transparency and education — not financial advice.",
    ],
    tags: ["Rates", "Macro", "Correlation"],
  },
  {
    slug: "index-resistance-and-rotation",
    date: "2025-11-27",
    title: "Index Resistance, Rotation, and Volatility of Leadership",
    excerpt:
      "Leadership rotated between sectors while volatility clustered. We outline what often works (and what breaks) in this regime.",
    body: [
      "Rotational regimes typically reward diversified factor exposure and punish concentrated bets when leadership flips quickly.",
      "We focus on avoiding overfitting: signals must be robust across regimes, not just optimized on the most recent months.",
      "In uncertain leadership environments, the goal is consistency — not maximal return in a single month.",
      "All statements here are for informational purposes only and do not constitute investment advice.",
    ],
    tags: ["Rotation", "Volatility", "Regime"],
  },
];

export function getInsightBySlug(slug: string): InsightPost | undefined {
  return MOCK_INSIGHTS.find((p) => p.slug === slug);
}
