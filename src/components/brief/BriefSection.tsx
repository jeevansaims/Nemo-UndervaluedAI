export default function BriefSection({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {bullets.map((b, i) => (
          <li key={i} className="leading-6">
            • {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
