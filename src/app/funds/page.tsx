import FundCard from "@/components/funds/FundCard";
import { MOCK_FUNDS } from "@/lib/funds/mockFunds";

export default function FundsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Funds</h1>
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
