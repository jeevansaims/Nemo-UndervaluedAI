import { fmtMoneyMaybe } from "@/lib/ui/format";
import type { CalendarCell } from "@/lib/calendar/calendarUtils";

type DayCellProps = {
  cell: CalendarCell;
  onClick: (iso: string) => void;
  isPublic?: boolean;
};

export default function DayCell({ cell, onClick, isPublic = false }: DayCellProps) {
  const pnl = cell.data?.pnl ?? null;
  const isPositive = pnl !== null && pnl >= 0;
  
  // Basic color logic
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
    <button
      onClick={() => onClick(cell.isoDate)}
      className={`w-full text-left rounded-2xl border ${border} ${bg} p-3 hover:bg-white/10 transition group relative`}
    >
      <div className="flex items-center justify-between">
        <div className={`text-xs ${cell.inMonth ? "text-white/60" : "text-white/25"}`}>
          {cell.day}
        </div>
        {cell.data?.trades !== undefined ? (
          <div className="text-[11px] text-white/40">{cell.data.trades} trades</div>
        ) : null}
      </div>

      <div className={`mt-3 text-sm font-semibold ${text}`}>
        {pnl === null ? "—" : fmtMoneyMaybe(pnl, isPublic)}
      </div>

      {cell.data?.winRatePct ? (
        <div className="mt-1 text-[11px] text-white/45">Win {cell.data.winRatePct}%</div>
      ) : (
        <div className="mt-1 text-[11px] text-white/20">&nbsp;</div>
      )}
    </button>
  );
}
