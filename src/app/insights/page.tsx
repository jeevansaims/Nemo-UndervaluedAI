"use client";

import { useEffect, useMemo, useState } from "react";
import InsightCard from "@/components/insights/InsightCard";
import { useInsights, type InsightPost as DBPost } from "@/lib/insights/useInsights";
import { type InsightPost as MockPost, MOCK_INSIGHTS } from "@/lib/insights/mockInsights";
import PublicModeToggle from "@/components/ui/PublicModeToggle";
import Link from "next/link";

// Adapter to unify types
function mapDBPostToMock(p: DBPost): MockPost {
    return {
        slug: p.slug,
        title: p.title,
        date: typeof p.createdAt === "string" ? p.createdAt.slice(0, 10) : new Date(p.createdAt).toISOString().slice(0, 10),
        excerpt: p.contentMd.slice(0, 120) + "...",
        body: p.contentMd.split("\n\n"),
        tags: p.tickers // Using tickers as tags for now, or we can add tags to DB model later
    };
}

export default function InsightsPage() {
  const { posts, loading } = useInsights();
  
  const allPosts = useMemo(() => {
    // Map DB posts to the format InsightCard expects
    const mapped = posts.map(mapDBPostToMock);
    const merged = [...mapped, ...MOCK_INSIGHTS];
    // newest first
    merged.sort((a, b) => (a.date < b.date ? 1 : -1));
    return merged;
  }, [posts]);

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
