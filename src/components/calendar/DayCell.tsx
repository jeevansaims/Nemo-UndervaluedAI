import type { CalendarCell } from "@/lib/calendar/calendarUtils";

function money(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

export default function DayCell({ cell }: { cell: CalendarCell }) {
  const pnl = cell.data?.pnl ?? null;

  const bg =
    pnl === null
      ? "bg-white/0"
      : pnl > 0
      ? "bg-emerald-500/10"
      : pnl < 0
      ? "bg-rose-500/10"
      : "bg-white/5";

  const border =
    pnl === null
      ? "border-white/10"
      : pnl > 0
      ? "border-emerald-500/20"
      : pnl < 0
      ? "border-rose-500/20"
      : "border-white/10";

  const text =
    pnl === null
      ? "text-white/50"
      : pnl > 0
      ? "text-emerald-300"
      : pnl < 0
      ? "text-rose-300"
      : "text-white/70";

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-3`}>
      <div className="flex items-center justify-between">
        <div className={`text-xs ${cell.inMonth ? "text-white/60" : "text-white/25"}`}>
          {cell.day}
        </div>
        {cell.data?.trades !== undefined ? (
          <div className="text-[11px] text-white/40">{cell.data.trades} trades</div>
        ) : null}
      </div>

      <div className={`mt-3 text-sm font-semibold ${text}`}>
        {pnl === null ? "—" : money(pnl)}
      </div>

      {cell.data?.winRatePct ? (
        <div className="mt-1 text-[11px] text-white/45">Win {cell.data.winRatePct}%</div>
      ) : (
        <div className="mt-1 text-[11px] text-white/20">&nbsp;</div>
      )}
    </div>
  );
}
