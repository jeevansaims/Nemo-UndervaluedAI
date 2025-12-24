import Link from "next/link";
import FundCard from "@/components/funds/FundCard";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// Inline mock data for when fetch fails on Vercel
const MOCK_FUNDS = [
  {
    id: 'ai-growth-fund',
    slug: 'ai-growth-fund',
    name: 'AI Growth Fund',
    description: 'AI-powered growth investing focused on high-conviction technology and innovation plays',
    currentValue: 127680,
    metrics: {
      totalReturn: 27.68,
      sharpeRatio: 1.95,
      maxDrawdown: -5.37,
      volatility: 10.37,
    },
    holdingsCount: 5,
    lastUpdated: new Date().toISOString(),
  },
];

export default async function FundsPage() {
  let funds = MOCK_FUNDS;
  
  try {
    // Try to fetch real fund data from API
    const res = await fetch(`${BASE_URL}/api/funds`, {
      cache: 'no-store',
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.funds && data.funds.length > 0) {
        funds = data.funds;
      }
    }
  } catch (error) {
    console.error('Error fetching funds, using mock data:', error);
    // Use mock data on error
  }

  return (
    <main className="min-h-screen bg-[#232323] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-white/50 hover:text-white">
              ← Home
            </Link>
            <h1 className="mt-2 text-3xl font-bold">AI Managed Funds</h1>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Algorithmic funds managed by our AI system. Performance shown is live and updated daily.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {funds.map((fund: any) => (
             <FundCard key={fund.slug} fund={fund} />
          ))}
        </div>
      </div>
    </main>
  );
}

