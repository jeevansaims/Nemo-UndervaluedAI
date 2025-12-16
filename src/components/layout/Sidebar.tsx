"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PublicModeToggle from "@/components/ui/PublicModeToggle";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Funds", href: "/funds" },
  { label: "P/L Calendar", href: "/calendar" },
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

        <div className="mt-8 text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-2">
          Tools
        </div>
        <div className="px-3 py-2 text-sm text-white/30 cursor-not-allowed">
          Ticker Analysis (Coming Soon)
        </div>
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div className="text-xs text-white/50">Privacy Mode</div>
          <PublicModeToggle />
        </div>
        <div className="mt-4 text-[10px] text-white/20 text-center">
          v0.5.0 • Undervalued Replica
        </div>
      </div>
    </aside>
  );
}
