import { finnhubGet } from "@/lib/market/finnhub";
import {
  FinnhubCompanyNewsSchema,
  FinnhubEarningsCalendarSchema,
  type FinnhubCompanyNews,
  type FinnhubEarningsCalendar,
} from "@/lib/validators/finnhub";
import { AlertItem } from "./alertSchemas";

export async function fetchCompanyNews(ticker: string, from: string, to: string): Promise<AlertItem[]> {
  try {
    const news = await finnhubGet<FinnhubCompanyNews>(
      "/company-news",
      { symbol: ticker, from, to },
      FinnhubCompanyNewsSchema
    );

    return news.map((item) => ({
      id: `news-${item.id}`,
      ts: item.datetime,
      ticker,
      type: "NEWS",
      severity: determineNewsSeverity(item.source || ""),
      title: item.headline,
      summary: item.summary,
      url: item.url,
      source: item.source,
    }));
  } catch (e) {
    console.warn(`Failed to fetch news for ${ticker}`, e);
    return [];
  }
}

export async function fetchEarnings(from: string, to: string): Promise<AlertItem[]> {
  // Finnhub earnings calendar is global or by symbol? The endpoint /calendar/earnings accepts from/to.
  // It returns a list for the date range.
  try {
    const data = await finnhubGet<FinnhubEarningsCalendar>(
      "/calendar/earnings",
      { from, to },
      FinnhubEarningsCalendarSchema
    );

    return (data.earningsCalendar || []).map((item) => ({
      id: `earnings-${item.symbol}-${item.date}`,
      ts: new Date(item.date || "").getTime() / 1000,
      ticker: item.symbol,
      type: "EARNINGS",
      severity: "HIGH", // Earnings are always important
      title: `Earnings Report`,
      summary: `EPS Est: ${item.epsEstimate ?? "?"} vs Act: ${item.epsActual ?? "?"}`,
      source: "Finnhub",
    }));
  } catch (e) {
    console.warn("Failed to fetch earnings", e);
    return [];
  }
}

// Simple heuristic for news importance
function determineNewsSeverity(source: string): "LOW" | "MED" | "HIGH" {
  const majorSources = ["Bloomberg", "CNBC", "Reuters", "WSJ", "Yahoo Finance"];
  if (majorSources.some((s) => source.includes(s))) return "HIGH";
  return "MED";
}

export async function aggregateAlerts(tickers: string[]): Promise<AlertItem[]> {
  // Date range: Last 7 days for news, next 14 days for earnings?
  // Actually, for a "feed", we usually want recent past.
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const from = sevenDaysAgo.toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);

  // Parallel fetch news for all tickers
  const newsPromises = tickers.map((t) => fetchCompanyNews(t, from, to));
  
  // Earnings: fetch globally for the range (fetching per ticker might be overkill if endpoint handles global)
  // Actually Finnhub /calendar/earnings allows filtering by symbol?, checks docs... 
  // It seems to return a lot. Let's just fetch news first. Earnings might be noisy if we get ALL.
  // To stick to tickers, we can filter the earnings result.
  const earningsPromise = fetchEarnings(from, to);

  const [newsResults, earningsResult] = await Promise.all([
    Promise.all(newsPromises),
    earningsPromise
  ]);

  let alerts = newsResults.flat();
  const relevantEarnings = earningsResult.filter(e => e.ticker && tickers.includes(e.ticker));
  
  alerts = [...alerts, ...relevantEarnings];

  // Sort by time desc
  return alerts.sort((a, b) => b.ts - a.ts);
}
