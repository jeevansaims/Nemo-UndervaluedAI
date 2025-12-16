import InsightCard from "@/components/insights/InsightCard";
import { MOCK_INSIGHTS } from "@/lib/insights/mockInsights";

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Weekly Market Analysis</h1>
        <p className="mt-2 text-sm text-white/60">
          Research notes for transparency and education. Not financial advice.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {MOCK_INSIGHTS.map((post) => (
            <InsightCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
