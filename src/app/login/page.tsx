"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-3xl font-bold text-blue-400">
          N
        </div>
        <h1 className="mb-2 text-2xl font-bold">Welcome Back</h1>
        <p className="mb-8 text-sm text-neutral-400">Sign in to your private terminal</p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/10 py-3 font-medium transition hover:bg-white/20 active:scale-[0.98]"
        >
          {/* Simple G Icon or just text */}
          <span className="text-lg font-bold">G</span>
          <span>Continue with Google</span>
        </button>

        <p className="mt-6 text-xs text-neutral-600">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
