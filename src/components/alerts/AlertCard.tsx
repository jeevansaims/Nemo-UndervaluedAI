import type { AlertItem } from "@/lib/alerts/mockAlerts";
import SubscribeToggle from "@/components/alerts/SubscribeToggle";

function badge(sev: AlertItem["severity"]) {
  if (sev === "HIGH") return "bg-red-500/15 text-red-200";
  if (sev === "MED") return "bg-amber-500/15 text-amber-200";
  return "bg-emerald-500/15 text-emerald-200";
}

export default function AlertCard({ a }: { a: AlertItem }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">
            {new Date(a.tsISO).toLocaleString()} • {a.type}
          </div>
          <div className="mt-2 text-sm font-semibold">{a.title}</div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs ${badge(a.severity)}`}>
            {a.severity}
          </span>
          {a.ticker ? <SubscribeToggle ticker={a.ticker} /> : null}
        </div>
      </div>

      <div className="mt-3 text-sm text-white/70">{a.details}</div>

      {a.sourceLabel ? (
        <div className="mt-4 text-xs text-white/40">Source: {a.sourceLabel}</div>
      ) : null}
    </div>
  );
}
