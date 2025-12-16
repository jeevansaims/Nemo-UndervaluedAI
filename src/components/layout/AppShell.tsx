"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import StatusBanner from "./StatusBanner";
import { useState } from "react";
import { useFreshness } from "@/lib/live/useFreshness";
import Link from "next/link";
import TickerSearch from "@/components/analysis/TickerSearch";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { ageSec, state } = useFreshness({
    staleAfterSec: 18,
    disconnectAfterSec: 60,
  });
  
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur border-b border-white/5 p-4 flex flex-col gap-4">
             <StatusBanner state={state} ageSec={ageSec} />
             <div className="flex items-center justify-between">
                 <div className="md:hidden">
                     {/* Mobile Hamburger Placeholder */}
                     <span className="text-white/50">☰</span>
                 </div>
                 <div className="flex-1 max-w-xl mx-auto">
                     <TickerSearch />
                 </div>
             </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-neutral-950/80 backdrop-blur z-30">
          <div className="font-bold text-lg">Nemo Trades</div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white/70 hover:text-white"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-neutral-950 p-6 pt-20">
             <SidebarMobile onClose={() => setMobileMenuOpen(false)} />
             <button 
               onClick={() => setMobileMenuOpen(false)}
               className="absolute top-4 right-4 text-white"
             >
               ✕
             </button>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarMobile({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <Link href="/" onClick={onClose} className="block text-lg font-medium p-2 border-b border-white/10">Dashboard</Link>
      <Link href="/funds" onClick={onClose} className="block text-lg font-medium p-2 border-b border-white/10">Funds</Link>
      <Link href="/calendar" onClick={onClose} className="block text-lg font-medium p-2 border-b border-white/10">P/L Calendar</Link>
      <Link href="/insights" onClick={onClose} className="block text-lg font-medium p-2 border-b border-white/10">Insights</Link>
    </div>
  );
}
