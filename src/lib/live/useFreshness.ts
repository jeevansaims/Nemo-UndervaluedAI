"use client";

import { useEffect, useMemo, useState } from "react";

export type LiveState = "live" | "stale" | "disconnected";

export function useFreshness(options?: {
  staleAfterSec?: number;
  disconnectAfterSec?: number;
  // if you later wire real data: set updatedAt to the time you last fetched data
  updatedAt?: number;
}) {
  const staleAfterSec = options?.staleAfterSec ?? 18;
  const disconnectAfterSec = options?.disconnectAfterSec ?? 60;

  const [now, setNow] = useState(() => Date.now());
  const updatedAt = options?.updatedAt ?? now; // default: "just updated"

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ageSec = useMemo(() => Math.max(0, Math.floor((now - updatedAt) / 1000)), [now, updatedAt]);

  const state: LiveState = useMemo(() => {
    if (ageSec >= disconnectAfterSec) return "disconnected";
    if (ageSec >= staleAfterSec) return "stale";
    return "live";
  }, [ageSec, staleAfterSec, disconnectAfterSec]);

  return { ageSec, state };
}
