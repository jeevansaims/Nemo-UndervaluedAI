export type StockList = {
  slug: string;
  name: string;
  description: string;
  category: "size" | "sector" | "region";
  tickers: string[];
};

export const STOCK_LISTS: StockList[] = [
  // By Size
  {
    slug: "micro-cap",
    name: "Micro Cap",
    description: "Small companies with market cap under $300M",
    category: "size",
    tickers: ["NXtp", "IRIX", "PRGS", "HWKN", "TATT"],
  },
  {
    slug: "small-cap",
    name: "Small Cap",
    description: "Companies with market cap between $300M - $2B",
    category: "size",
    tickers: ["CZFS", "CVCO", "DNOW", "DIOD", "ICUI"],
  },
  {
    slug: "mid-cap",
    name: "Mid Cap",
    description: "Mid-sized companies with market cap between $2B - $10B",
    category: "size",
    tickers: ["CELH", "COHR", "DECK", "EXAS", "GNRC"],
  },
  {
    slug: "large-cap",
    name: "Large Cap",
    description: "Major companies with market cap over $10B",
    category: "size",
    tickers: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK.B"],
  },

  // By Sector
  {
    slug: "technology",
    name: "Technology",
    description: "Software, hardware, and IT services companies",
    category: "sector",
    tickers: ["AAPL", "MSFT", "GOOGL", "META", "ORCL", "ADBE", "CRM", "INTU"],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Pharmaceutical, biotech, and medical device companies",
    category: "sector",
    tickers: ["JNJ", "UNH", "PFE", "ABBV", "TMO", "DHR", "ABT", "LLY"],
  },
  {
    slug: "financial",
    name: "Financial Services",
    description: "Banks, insurance, and financial technology",
    category: "sector",
    tickers: ["JPM", "BAC", "WFC", "GS", "MS", "C", "BLK", "SCHW"],
  },
  {
    slug: "energy",
    name: "Energy",
    description: "Oil, gas, and renewable energy companies",
    category: "sector",
    tickers: ["XOM", "CVX", "COP", "SLB", "EOG", "MPC", "PSX", "VLO"],
  },
  {
    slug: "semiconductor",
    name: "Semiconductor",
    description: "Chip manufacturers and semiconductor equipment",
    category: "sector",
    tickers: ["NVDA", "AVGO", "AMD", "QCOM", "INTC", "TXN", "AMAT", "LRCX"],
  },
  {
    slug: "biotech",
    name: "Biotech",
    description: "Biotechnology and life sciences companies",
    category: "sector",
    tickers: ["GILD", "AMGN", "VRTX", "REGN", "BIIB", "ILMN", "MRNA", "ALNY"],
  },
];

export function getListBySlug(slug: string): StockList | undefined {
  return STOCK_LISTS.find((list) => list.slug === slug);
}

export function getListsByCategory(category: "size" | "sector" | "region"): StockList[] {
  return STOCK_LISTS.filter((list) => list.category === category);
}
