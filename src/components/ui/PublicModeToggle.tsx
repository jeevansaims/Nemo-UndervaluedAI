"use client";

import { useEffect, useState } from "react";
import { getPublicMode, setPublicMode } from "@/lib/ui/uiStore";

export default function PublicModeToggle() {
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    setIsPublic(getPublicMode());
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-xs text-white/60">Public mode</div>
      <button
        onClick={() => {
          const next = !isPublic;
          setIsPublic(next);
          setPublicMode(next);
          // quick refresh so all pages recalc without wiring global context (simple + reliable)
          window.location.reload();
        }}
        className={`h-6 w-11 rounded-full border border-white/10 transition ${
          isPublic ? "bg-emerald-500/30" : "bg-white/10"
        }`}
        aria-label="Toggle public mode"
      >
        <div
          className={`h-5 w-5 rounded-full bg-white transition ${
            isPublic ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <div className="text-xs text-white/50">{isPublic ? "ON" : "OFF"}</div>
    </div>
  );
}
