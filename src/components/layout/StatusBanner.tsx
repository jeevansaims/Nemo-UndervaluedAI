"use client";

import { useState } from "react";

export default function StatusBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Connection Active: Data streaming via WebSocket</span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 text-white/40 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
