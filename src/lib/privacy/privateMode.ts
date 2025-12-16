"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "nemo_private_mode";

export function usePrivateMode(params: { isAuthed: boolean }) {
  const { isAuthed } = params;

  const [enabled, setEnabled] = useState(false);

  // Load persisted value (only if authed)
  useEffect(() => {
    if (!isAuthed) {
      setEnabled(false);
      return;
    }
    const raw = localStorage.getItem(KEY);
    setEnabled(raw === "true");
  }, [isAuthed]);

  // Persist changes (only if authed)
  useEffect(() => {
    if (!isAuthed) return;
    localStorage.setItem(KEY, enabled ? "true" : "false");
  }, [enabled, isAuthed]);

  return useMemo(
    () => ({
      privateMode: isAuthed ? enabled : false, // force public when logged out
      setPrivateMode: (v: boolean) => setEnabled(isAuthed ? v : false),
      toggle: () => setEnabled((p) => (isAuthed ? !p : false)),
    }),
    [enabled, isAuthed]
  );
}
