"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, X, Home, ChevronRight } from "lucide-react";

// Breadcrumb mapping for routes
const routeLabels: Record<string, string> = {
  'funds': 'Funds',
  'alerts': 'Insider Alerts',
  'insights': 'Insights',
  'ai-analysis': 'Analysis',
  'lists': 'Lists',
  'login': 'Login',
};

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Parse pathname into breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  const isHomePage = pathname === '/';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#303741]/80 backdrop-blur-md">
        {/* Left side: Logo + Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lg font-semibold text-white hover:text-white/80 transition">
            Nemo-Undervalued
          </Link>
          
          {/* Breadcrumbs (only on subpages) */}
          {!isHomePage && pathSegments.length > 0 && (
            <div className="flex items-center gap-1 text-white/50">
              <ChevronRight className="h-4 w-4" />
              <Link href="/" className="hover:text-white transition flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              
              {pathSegments.map((segment, index) => {
                const path = '/' + pathSegments.slice(0, index + 1).join('/');
                const isLast = index === pathSegments.length - 1;
                const label = routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <div key={path} className="flex items-center gap-1">
                    <span className="text-white/30">/</span>
                    {isLast ? (
                      <span className="text-white font-medium">{label}</span>
                    ) : (
                      <Link href={path} className="hover:text-white transition">
                        {label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side: User menu */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          ) : session?.user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold hover:opacity-80 transition"
            >
              {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* User Menu Sidebar */}
      {showUserMenu && session?.user && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowUserMenu(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-neutral-900 border-l border-white/10 p-6 flex flex-col">
            <button
              onClick={() => setShowUserMenu(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* User Info */}
            <div className="mb-6">
              <div className="text-lg font-semibold text-white">
                {session.user.name || "User"}
              </div>
              <div className="text-sm text-white/50">{session.user.email}</div>
            </div>

            {/* Quick Navigation */}
            <div className="mb-6 space-y-2">
              <div className="text-xs font-semibold uppercase text-white/40 mb-2">Quick Links</div>
              <Link 
                href="/funds" 
                onClick={() => setShowUserMenu(false)}
                className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                AI Funds
              </Link>
              <Link 
                href="/alerts" 
                onClick={() => setShowUserMenu(false)}
                className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Insider Alerts
              </Link>
              <Link 
                href="/insights" 
                onClick={() => setShowUserMenu(false)}
                className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Weekly Insights
              </Link>
            </div>

            {/* Plan Info */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
              <div className="text-xs font-semibold uppercase text-white/50 mb-2">
                Free Plan
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Analyses</span>
                  <span className="text-white font-medium">3 / 15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Refreshes</span>
                  <span className="text-white font-medium">0 / 2</span>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="block text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition mb-4"
            >
              Upgrade plan
            </Link>

            {/* Logout */}
            <button
              onClick={() => signOut()}
              className="mt-auto flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </>
  );
}

