/**
 * Yahoo Finance helper for fetching historical stock data
 * Uses the yahoo-finance2 package (free, no API key required)
 */

import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export type DailyClose = {
  date: string;  // YYYY-MM-DD
  close: number;
};

/**
 * Fetch daily closing prices for a symbol between two unix timestamps
 */
export async function fetchDailyCloses(
  symbol: string,
  fromUnix: number,
  toUnix: number
): Promise<DailyClose[]> {
  try {
    const period1 = new Date(fromUnix * 1000);
    const period2 = new Date(toUnix * 1000);

    const data = await yahooFinance.chart(symbol, {
      period1,
      period2,
      interval: '1d',
    });

    if (!data.quotes || data.quotes.length === 0) {
      return [];
    }

    return data.quotes
      .filter((q) => q.close !== null && q.date !== null)
      .map((q) => ({
        date: q.date!.toISOString().slice(0, 10),
        close: q.close!,
      }));
  } catch (error) {
    console.error(`Yahoo Finance error for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch current quote for a symbol
 */
export async function fetchQuote(symbol: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
} | null> {
  try {
    const data = await yahooFinance.quote(symbol);
    
    return {
      price: data.regularMarketPrice ?? 0,
      change: data.regularMarketChange ?? 0,
      changePercent: data.regularMarketChangePercent ?? 0,
    };
  } catch (error) {
    console.error(`Yahoo Finance quote error for ${symbol}:`, error);
    return null;
  }
}
