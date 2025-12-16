"use client";

import { useSession } from "next-auth/react";
import { usePrivateMode } from "@/lib/privacy/privateMode";

export default function PrivateModeToggle() {
  const { data } = useSession();
  const isAuthed = !!data?.user?.email;

  const { privateMode, toggle } = usePrivateMode({ isAuthed });

  if (!isAuthed) return null;

  return (
    <button
      onClick={toggle}
      className={`rounded-md border px-3 py-1 text-sm transition-colors ${
          privateMode 
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
            : "border-white/10 hover:bg-white/5 text-white/60 hover:text-white"
      }`}
      title="Toggle private mode"
      type="button"
    >
      {privateMode ? "Private" : "Public"}
    </button>
  );
}
