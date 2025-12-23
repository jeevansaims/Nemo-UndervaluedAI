import Link from "next/link";
import type { InsightPost } from "@/lib/insights/mockInsights";

export default function InsightCard({ post }: { post: InsightPost }) {
  return (
    <Link
      href={`/insights/${post.slug}`}
      className="group flex flex-col justify-between h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10 hover:border-white/20"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-white/40">
           <span>{new Date(post.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span>
           <span>5 min read</span>
        </div>

        <div className="mt-4 text-xl font-bold leading-tight text-white group-hover:text-emerald-400 transition-colors">
          {post.title}
        </div>

        <div className="mt-3 text-sm text-white/60 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
            {post.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium bg-white/5 text-white/50 border border-white/5">
                    {tag}
                </span>
            ))}
        </div>
        <div className="text-xs font-medium text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Read Note →
        </div>
      </div>
    </Link>
  );
}
