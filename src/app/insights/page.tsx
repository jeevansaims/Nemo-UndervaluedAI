"use client";

import { useEffect, useMemo, useState } from "react";
import InsightCard from "@/components/insights/InsightCard";
import { MOCK_INSIGHTS, type InsightPost } from "@/lib/insights/mockInsights";
import { loadCustomInsights } from "@/lib/insights/insightStore";
import Link from "next/link";
import PublicModeToggle from "@/components/ui/PublicModeToggle";

export default function InsightsPage() {
  const [custom, setCustom] = useState<InsightPost[]>([]);

  useEffect(() => {
    setCustom(loadCustomInsights());
  }, []);

  const allPosts = useMemo(() => {
    const merged = [...custom, ...MOCK_INSIGHTS];
    // newest first
    merged.sort((a, b) => (a.date < b.date ? 1 : -1));
    return merged;
  }, [custom]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Weekly Market Analysis</h1>
            <p className="mt-2 text-sm text-white/60">
              Research notes for transparency and education. Not financial advice.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <PublicModeToggle />
             <Link
               href="/insights/new"
               className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
             >
               + New post
             </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {allPosts.map((post) => (
            <InsightCard key={`${post.slug}-${post.date}`} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
