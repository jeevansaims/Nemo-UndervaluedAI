"use client";

import { useEffect, useState } from "react";
import { loadAlertSubs, toggleAlertSub } from "@/lib/alerts/alertStore";

export default function SubscribeToggle({ ticker }: { ticker: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const subs = loadAlertSubs();
    setOn(subs.includes(ticker.toUpperCase()));
  }, [ticker]);

  return (
    <button
      onClick={() => {
        const res = toggleAlertSub(ticker);
        setOn(res.isOn);
      }}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
      title="Local-only subscription (Phase 9C can add email/push delivery)"
    >
      {on ? "🔔 Subscribed" : "🔕 Subscribe"}
    </button>
  );
}
