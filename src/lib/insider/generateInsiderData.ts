// Generate realistic insider trading data

export interface InsiderTrade {
  id: string;
  ticker: string;
  companyName: string;
  insiderName: string;
  relation: string; // CEO, CFO, Director, 10% Owner
  transactionType: 'Buy' | 'Sell';
  transactionDate: string;
  reportDate: string;
  shares: number;
  price: number;
  value: number;
  ownership: number; // Post-transaction ownership
}

const COMPANIES = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
  { ticker: 'PLTR', name: 'Palantir Technologies' },
  { ticker: 'COIN', name: 'Coinbase Global' },
  { ticker: 'HOOD', name: 'Robinhood Markets' },
];

const INSIDERS = [
  { name: 'Jensen Huang', relation: 'CEO' },
  { name: 'Elon Musk', relation: 'CEO & 10% Owner' },
  { name: 'Tim Cook', relation: 'CEO' },
  { name: 'Satya Nadella', relation: 'CEO' },
  { name: 'Mark Zuckerberg', relation: 'CEO & 10% Owner' },
  { name: 'Jeff Bezos', relation: '10% Owner' },
  { name: 'Lisa Su', relation: 'CEO' },
  { name: 'Peter Thiel', relation: 'Director' },
  { name: 'Cathie Wood', relation: '10% Owner' },
  { name: 'Brian Armstrong', relation: 'CEO' },
];

function randomDate(startDaysAgo: number, endDaysAgo: number) {
  const date = new Date();
  const days = startDaysAgo + Math.random() * (endDaysAgo - startDaysAgo);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function generateInsiderTrades(count: number = 50): InsiderTrade[] {
  return Array.from({ length: count }).map((_, i) => {
    const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    // Try to match CEO to company if possible for realism, otherwise random
    const insider = INSIDERS[Math.floor(Math.random() * INSIDERS.length)];
    
    const type: 'Buy' | 'Sell' = Math.random() > 0.6 ? 'Sell' : 'Buy'; // slightly more sells usually
    const price = 50 + Math.random() * 450;
    const shares = Math.floor(1000 + Math.random() * 50000);
    const value = price * shares;
    
    // Simulate reporting lag (1-3 days after transaction)
    const txDateRaw = randomDate(2, 60);
    const txDate = new Date(txDateRaw);
    const reportDate = new Date(txDate);
    reportDate.setDate(reportDate.getDate() + Math.ceil(Math.random() * 3));

    return {
      id: `insider-${i}`,
      ticker: company.ticker,
      companyName: company.name,
      insiderName: insider.name,
      relation: insider.relation,
      transactionType: type,
      transactionDate: txDate.toISOString(),
      reportDate: reportDate.toISOString(),
      shares,
      price: Number(price.toFixed(2)),
      value: Number(value.toFixed(2)),
      ownership: Math.floor(shares * (10 + Math.random() * 20)), // Random remaining ownership
    };
  }).sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
}
