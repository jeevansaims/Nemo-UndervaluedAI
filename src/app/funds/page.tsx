import Link from "next/link";
import FundCard from "@/components/funds/FundCard";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default async function FundsPage() {
  // Fetch real fund data from API
  const res = await fetch(`${BASE_URL}/api/funds`, {
    cache: 'no-store', // Always get fresh data
  });
  
  if (!res.ok) {
    return (
      <main className="min-h-screen bg-[#232323] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold">Error Loading Funds</h1>
          <p className="mt-4">Failed to load fund data. Please try again later.</p>
        </div>
      </main>
    );
  }
  
  const { funds } = await res.json();

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
