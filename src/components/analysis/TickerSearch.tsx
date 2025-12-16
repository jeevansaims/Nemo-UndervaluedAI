"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TickerSearch() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const t = ticker.trim().toUpperCase();
        if (!t) return;
        router.push(`/analysis/${t}`);
      }}
      className="w-full max-w-md"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Search ticker (e.g., AAPL)"
          className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
        />
        <button
          type="submit"
          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
        >
          Search
        </button>
      </div>
    </form>
  );
}
