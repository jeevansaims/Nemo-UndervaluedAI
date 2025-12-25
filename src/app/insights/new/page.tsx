"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useInsights } from "@/lib/insights/useInsights";

export default function NewInsightPage() {
  const router = useRouter();
  const { createInsight } = useInsights();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tickers, setTickers] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSaving(true);
    try {
      const tickerList = tickers
        .split(",")
        .map(t => t.trim().toUpperCase())
        .filter(Boolean);

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      await createInsight({
        title,
        contentMd: content,
        tickers: tickerList,
        slug,
        status: "PUBLISHED"
      });

      router.push("/insights");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#303741] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/insights" className="text-sm text-white/50 hover:text-white">
              ← Back to Insights
            </Link>
            <h1 className="mt-2 text-3xl font-bold">New Research Note</h1>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={saving || !title || !content}
            className="rounded-full bg-emerald-500/10 px-6 py-2 text-sm font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Publish Note"}
          </button>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm text-white/40 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Identifying Rotation in Semi-Conductors"
              className="w-full bg-[#313131] border border-[#404040] rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-emerald-500/50 transition placeholder:text-white/20"
            />
          </div>

          {/* Tickers Input */}
          <div>
            <label className="block text-sm text-white/40 mb-2">Related Tickers (comma separated)</label>
            <input
              type="text"
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
              placeholder="e.g., NVDA, AMD, SOXX"
              className="w-full bg-[#313131] border border-[#404040] rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition placeholder:text-white/20"
            />
          </div>

          {/* Editor Area */}
          <div>
            <label className="block text-sm text-white/40 mb-2">Analysis Content (Markdown supported)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your analysis here..."
              className="w-full h-[500px] bg-[#313131] border border-[#404040] rounded-xl p-4 font-mono text-sm leading-relaxed focus:outline-none focus:border-emerald-500/50 transition placeholder:text-white/20 resize-none"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
