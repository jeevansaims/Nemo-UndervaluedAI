"use client";

import type { AlertType } from "@/lib/alerts/alertSchemas";

export default function AlertFilters({
  active,
  onChange,
}: {
  active: "ALL" | AlertType;
  onChange: (v: "ALL" | AlertType) => void;
}) {
  const tabs: Array<"ALL" | AlertType> = ["ALL", "NEWS", "EARNINGS", "INSIDER", "MACRO", "SYSTEM"];

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`rounded-xl px-4 py-2 text-xs transition ${
            active === t ? "bg-white/15" : "hover:bg-white/10"
          }`}
        >
          {t === "ALL" ? "All" : t}
        </button>
      ))}
    </div>
  );
}
