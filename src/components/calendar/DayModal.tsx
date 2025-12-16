import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Assuming you have a Dialog component or using standard HTML if not
import type { DailyPnl } from "@/lib/calendar/mockDaily";
import { getPublicMode } from "@/lib/ui/uiStore";
import { fmtMoneyMaybe } from "@/lib/ui/format";

type DayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  day: DailyPnl | null;
};

export default function DayModal({ isOpen, onClose, day }: DayModalProps) {
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    setIsPublic(getPublicMode());
  }, []);

  if (!isOpen || !day) return null;

  const dateStr = new Date(day.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/50">Day Detail</div>
            <div className="mt-1 text-xl font-semibold">{day?.date ?? "—"}</div>
            <div className="mt-1 text-sm text-white/60">{day?.fund ?? "—"}</div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">P/L</div>
            <div className={`mt-1 text-lg font-semibold ${((day?.pnl ?? 0) >= 0) ? "text-emerald-300" : "text-rose-300"}`}>
              {day ? money(day.pnl) : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Trades</div>
            <div className="mt-1 text-lg font-semibold">{day?.trades ?? "—"}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/50">Win Rate</div>
            <div className="mt-1 text-lg font-semibold">{day?.winRatePct ?? "—"}%</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold">Breakdown (blurred)</div>
          <div className="mt-2 space-y-2">
            {(day?.items ?? []).length === 0 ? (
              <div className="text-sm text-white/50">No details available.</div>
            ) : (
              day!.items!.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="text-3xl font-bold tracking-tight">
            {fmtMoneyMaybe(day.pnl, isPublic)}
          </div>
          <div
            className={`mt-1 text-sm font-medium ${
              day.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {day.pnl >= 0 ? "+" : ""}
            {day.romPct.toFixed(2)}% ROM               </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 text-xs text-white/40">
            Strategy labels are intentionally blurred to protect IP.
          </div>
        </div>
      </div>
    </div>
  );
}
