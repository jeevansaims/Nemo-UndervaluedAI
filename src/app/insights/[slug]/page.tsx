import Link from "next/link";
import { getInsightBySlug } from "@/lib/insights/mockInsights";

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getInsightBySlug(slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-10">
        <div>Post not found.</div>
        <Link className="mt-4 inline-block text-sm text-white/60" href="/insights">
          ← Back to Insights
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/insights" className="text-sm text-white/60">
          ← Back to Insights
        </Link>

        <div className="mt-4 text-xs text-white/50">
          {new Date(post.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })}
        </div>

        <h1 className="mt-2 text-3xl font-semibold leading-tight">
          {post.title}
        </h1>

        {post.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-8 space-y-4 text-sm leading-7 text-white/80">
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
          <div className="font-semibold text-white/80">Disclaimer</div>
          <div className="mt-2">
            This content is for informational and educational purposes only and
            does not constitute investment advice or a solicitation to buy or
            sell securities.
          </div>
        </div>
      </div>
    </main>
  );
}
