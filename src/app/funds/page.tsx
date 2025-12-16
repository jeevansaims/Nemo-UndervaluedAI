import Link from "next/link";
import FundCard from "@/components/funds/FundCard";
import { MOCK_FUNDS } from "@/lib/funds/mockFunds";
import PublicModeToggle from "@/components/ui/PublicModeToggle";

export default function FundsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-white/50 hover:text-white">
              ← Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold">Institutional Funds</h1>
          </div>
          <PublicModeToggle />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Hypothetical performance. Strategies intentionally undisclosed.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {MOCK_FUNDS.map((fund) => (
            <FundCard key={fund.slug} fund={fund} />
          ))}
        </div>
      </div>
    </main>
  );
}
