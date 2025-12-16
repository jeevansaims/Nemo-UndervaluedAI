"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { InsightPost } from "@/lib/insights/mockInsights";
import { addCustomInsight } from "@/lib/insights/insightStore";
import { buildExcerpt, slugify } from "@/lib/insights/insightHelpers";
import Link from "next/link";

export default function NewInsightPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState("Macro, Volatility");
  const [body, setBody] = useState(
    "Write your weekly note here.\n\nKeep it high-level. No signals. No trade instructions."
  );

  const computedSlug = useMemo(() => slugify(title || "weekly-note"), [title]);

  function handleCreate() {
    const paragraphs = body
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const post: InsightPost = {
      slug: computedSlug,
      date,
      title: title.trim() || "Weekly Note",
      excerpt: buildExcerpt(paragraphs.join(" ")),
      body: paragraphs,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    addCustomInsight(post);
    router.push(`/insights/${post.slug}`);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link href="/insights" className="text-sm text-white/60">
            ← Back
          </Link>
          <div className="text-xs text-white/50">Local draft (browser storage)</div>
        </div>

        <h1 className="mt-4 text-3xl font-semibold">New weekly post</h1>
        <p className="mt-2 text-sm text-white/60">
          Keep it research-style. No signals. Not investment advice.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm"
              placeholder="e.g., Liquidity Tightness and Narrow Breadth"
            />
            <div className="mt-2 text-xs text-white/40">Slug: {computedSlug}</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50">Tags (comma separated)</div>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm"
                placeholder="Macro, Rates, Volatility"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Body</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 h-56 w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm"
            />
            <div className="mt-2 text-xs text-white/40">
              Tip: Use blank lines for paragraphs.
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
          >
            Create post
          </button>
        </div>
      </div>
    </main>
  );
}
