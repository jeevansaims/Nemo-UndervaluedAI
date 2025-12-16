"use client";

"use client";

import type { LiveState } from "@/lib/live/useFreshness";

export default function StatusBanner({
  state,
  ageSec,
}: {
  state: LiveState;
  ageSec: number;
}) {
  if (state === "live") return null;

  const msg =
    state === "stale"
      ? `Data is more than ${ageSec} seconds old.`
      : `Live connection lost. Data is more than ${ageSec} seconds old.`;

  return (
    <div className="w-full border-b border-white/10 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
      {msg}
    </div>
  );
}
