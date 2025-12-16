"use client";

import { useState } from "react";
import { saveBriefEmail } from "@/lib/brief/briefStore";

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm font-semibold">Daily brief email</div>
      <div className="mt-1 text-xs text-white/50">
        Local-first capture (Phase 9C can send via Resend/Mailchimp).
      </div>

      {done ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Added! You’ll be included when delivery is wired.
        </div>
      ) : (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setErr(null);
            const v = email.trim();
            if (!isValidEmail(v)) {
              setErr("Enter a valid email.");
              return;
            }
            saveBriefEmail(v);
            setDone(true);
          }}
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm outline-none placeholder:text-white/40"
          />
          <button
            type="submit"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
          >
            Subscribe
          </button>
        </form>
      )}

      {err ? <div className="mt-2 text-xs text-red-200">{err}</div> : null}

      <div className="mt-4 text-xs text-white/40">
        Not investment advice. Educational summary only.
      </div>
    </div>
  );
}
