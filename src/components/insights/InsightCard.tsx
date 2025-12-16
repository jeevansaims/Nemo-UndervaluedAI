import Link from "next/link";
import type { InsightPost } from "@/lib/insights/mockInsights";

export default function InsightCard({ post }: { post: InsightPost }) {
  return (
    <Link
      href={`/insights/${post.slug}`}
      className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
    >
      <div className="h-28 w-full rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0" />

      <div className="mt-4 text-xs text-white/50">
        {new Date(post.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })}
      </div>

      <div className="mt-2 text-lg font-semibold leading-snug">
        {post.title}
      </div>

      <div className="mt-2 text-sm text-white/60">
        {post.excerpt}
      </div>

      <div className="mt-4 text-xs text-white/40">
        Read more →
      </div>
    </Link>
  );
}
