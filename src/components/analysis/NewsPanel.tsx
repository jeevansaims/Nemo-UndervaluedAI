export default function NewsPanel({ ticker }: { ticker: string }) {
  const items = [
    { title: `${ticker}: Earnings / guidance discussion (mock)`, href: "#" },
    { title: `${ticker}: Analyst note roundup (mock)`, href: "#" },
    { title: `${ticker}: Macro headline impact summary (mock)`, href: "#" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm font-semibold">News</div>
      <div className="mt-1 text-xs text-white/50">
        Placeholder sources (Phase 8C will add real news).
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.title} className="text-white/80">
            <a className="hover:underline hover:text-white transition-colors" href={i.href}>
              {i.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
