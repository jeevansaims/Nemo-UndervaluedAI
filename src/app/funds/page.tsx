import Link from "next/link";
import FundCard from "@/components/funds/FundCard";
import { prisma } from "@/lib/prisma";

export default async function FundsPage() {
  // Fetch fund data directly from database
  const funds = await prisma.fund.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      updatedAt: true,
    },
  });
  
  // Get latest snapshot for each fund to show current metrics
  const fundsWithMetrics = await Promise.all(
    funds.map(async (fund) => {
      const latestSnapshot = await prisma.fundSnapshot.findFirst({
        where: { fundId: fund.id },
        orderBy: { date: 'desc' },
        select: {
          date: true,
          equity: true,
          metrics: true,
        },
      });
      
      const holdingsCount = await prisma.holding.count({
        where: { fundId: fund.id },
      });
      
      return {
        ...fund,
        currentValue: latestSnapshot?.equity || 100,
        metrics: latestSnapshot?.metrics || null,
        holdingsCount,
        lastUpdated: latestSnapshot?.date || fund.updatedAt,
      };
    })
  );
  
  // Filter to only show funds with snapshots (active funds)
  const activeFunds = fundsWithMetrics.filter(f => f.metrics !== null);

  return (
    <main className="min-h-screen bg-[#303741] text-white pt-16">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">AI Managed Funds</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Algorithmic funds managed by our AI system. Performance shown is live and updated daily.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeFunds.map((fund: any) => (
             <FundCard key={fund.slug} fund={fund} />
          ))}
        </div>
      </div>
    </main>
  );
}
