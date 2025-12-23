// Common stock tickers with company names for search
export const STOCK_TICKERS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corporation" },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "NVDA", name: "NVIDIA Corporation" },
  { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "TSLA", name: "Tesla, Inc." },
  { ticker: "BRK.B", name: "Berkshire Hathaway Inc." },
  { ticker: "V", name: "Visa Inc." },
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "WMT", name: "Walmart Inc." },
  { ticker: "JPM", name: "JPMorgan Chase & Co." },
  { ticker: "MA", name: "Mastercard Incorporated" },
  { ticker: "PG", name: "Procter & Gamble Co." },
  { ticker: "UNH", name: "UnitedHealth Group Incorporated" },
  { ticker: "HD", name: "Home Depot Inc." },
  { ticker: "CVX", name: "Chevron Corporation" },
  { ticker: "MRK", name: "Merck & Co. Inc." },
  { ticker: "ABBV", name: "AbbVie Inc." },
  { ticker: "KO", name: "Coca-Cola Co." },
  { ticker: "PEP", name: "PepsiCo Inc." },
  { ticker: "COST", name: "Costco Wholesale Corporation" },
  { ticker: "AVGO", name: "Broadcom Inc." },
  { ticker: "MCD", name: "McDonald's Corporation" },
  { ticker: "TMO", name: "Thermo Fisher Scientific Inc." },
  { ticker: "CSCO", name: "Cisco Systems Inc." },
  { ticker: "ABT", name: "Abbott Laboratories" },
  { ticker: "ACN", name: "Accenture plc" },
  { ticker: "ADBE", name: "Adobe Inc." },
  { ticker: "DHR", name: "Danaher Corporation" },
  { ticker: "LIN", name: "Linde plc" },
  { ticker: "NKE", name: "NIKE Inc." },
  { ticker: "TXN", name: "Texas Instruments Incorporated" },
  { ticker: "NFLX", name: "Netflix Inc." },
  { ticker: "PM", name: "Philip Morris International Inc." },
  { ticker: "UPS", name: "United Parcel Service Inc." },
  { ticker: "CRM", name: "Salesforce Inc." },
  { ticker: "ORCL", name: "Oracle Corporation" },
  { ticker: "INTC", name: "Intel Corporation" },
  { ticker: "AMD", name: "Advanced Micro Devices Inc." },
  { ticker: "QCOM", name: "QUALCOMM Incorporated" },
  { ticker: "IBM", name: "International Business Machines Corporation" },
  { ticker: "BA", name: "Boeing Co." },
  { ticker: "GE", name: "General Electric Co." },
  { ticker: "DIS", name: "Walt Disney Co." },
  { ticker: "HON", name: "Honeywell International Inc." },
  { ticker: "CAT", name: "Caterpillar Inc." },
  { ticker: "MMM", name: "3M Co." },
  { ticker: "AXP", name: "American Express Co." },
  { ticker: "GS", name: "Goldman Sachs Group Inc." },
];

export function searchTickers(query: string, limit: number = 6) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.toUpperCase();

  return STOCK_TICKERS
    .filter(stock =>
      stock.ticker.includes(searchTerm) ||
      stock.name.toUpperCase().includes(searchTerm.toUpperCase())
    )
    .slice(0, limit);
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}
