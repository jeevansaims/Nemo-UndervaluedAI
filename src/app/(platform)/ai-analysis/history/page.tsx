import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HistoryGrid from "@/components/analysis/HistoryGrid";

export default async function HistoryPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <p>Please sign in to view your history.</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <p>User not found.</p>
      </div>
    );
  }

  const history = await prisma.stockAnalysis.findMany({
    where: {
      userId: user.id
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href="/ai-analysis"
              className="mb-4 inline-flex items-center text-sm text-neutral-400 transition-colors hover:text-white"
            >
              ← Back to Analysis
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">Analysis History</h1>
            <p className="mt-2 text-neutral-400">
              View your past AI stock analyses and recommendations
            </p>
          </div>
        </div>

        {/* Content */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50 py-24 text-center">
            <div className="mb-4 rounded-full bg-neutral-800 p-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-white">No history yet</h3>
            <p className="mt-2 max-w-md text-neutral-400">
              You haven't run any analyses yet. Search for a ticker to get started.
            </p>
            <Link
              href="/ai-analysis"
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-500"
            >
              Start Analysis
            </Link>
          </div>
        ) : (
          <HistoryGrid history={history} />
        )}
      </div>
    </main>
  );
}
