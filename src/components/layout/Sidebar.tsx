"use client";

import { SessionProvider } from "next-auth/react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PublicModeToggle from "@/components/ui/PublicModeToggle";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Funds", href: "/funds" },
  { label: "P/L Calendar", href: "/pl-calendar" },
  { label: "Daily Review", href: "/daily-review" },
  { label: "Weekly Review", href: "/weekly-review" },
  { label: "Insights", href: "/insights" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-neutral-950 flex flex-col z-40 hidden md:flex">
      {/* Brand */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="block">
          <div className="text-xs text-white/50 uppercase tracking-wider">Nemo Trades</div>
          <div className="mt-1 text-lg font-bold tracking-tight text-white">
            Performance
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-2 mt-2">
          Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/insights"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith("/insights")
              ? "bg-white/10 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>✨</span>
          Insights
        </Link>
        <Link
          href="/alerts"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith("/alerts")
              ? "bg-white/10 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>🔔</span>
          Alerts
        </Link>
        <Link
          href="/brief"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith("/brief")
              ? "bg-white/10 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>🗞️</span>
          Daily Brief
        </Link>

        <div className="mt-8 text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-2">
          Tools
        </div>
        <div className="px-3 py-2 text-sm text-white/30 cursor-not-allowed">
          Ticker Analysis (Coming Soon)
        </div>
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <UserProfile />
        
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div className="text-xs text-white/50">Privacy Mode</div>
          <PublicModeToggle />
        </div>
        
        <div className="text-[10px] text-white/20 text-center">
          v0.5.0 • Undervalued Replica
        </div>
      </div>
    </aside>
  );
}

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="h-10 w-full animate-pulse rounded-lg bg-white/5" />;

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-600/20"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="group relative">
      <div className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-white/5">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
            {session.user.name?.[0] || "U"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{session.user.name}</div>
          <div className="truncate text-xs text-white/50">{session.user.email}</div>
        </div>
      </div>
      
      {/* Popover helper could go here, or just a simple sign out button below */}
      <button
        onClick={() => signOut()}
        className="mt-1 w-full rounded-md px-2 py-1 text-xs text-white/30 hover:bg-white/5 hover:text-white/60 text-left"
      >
        Sign Out
      </button>
    </div>
  );
}
