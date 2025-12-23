"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  TrendingUp, 
  Bell, 
  BookOpen, 
  MoreHorizontal, 
  Lightbulb, 
  List,
  HelpCircle,
  Search
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [showMore, setShowMore] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      router.push(`/ai-analysis?ticker=${ticker.toUpperCase()}`);
    }
  };

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Blue glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Heading */}
          <h1 className="text-center text-4xl font-bold md:text-5xl">
            Which stock do you want me to analyze?
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Ticker or Company..."
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 px-6 py-4 text-center text-lg backdrop-blur-sm placeholder:text-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 p-2 hover:bg-blue-700 transition"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/funds"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 hover:bg-white/10 transition"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">AI Funds</span>
            </Link>

            <Link
              href="/alerts"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 hover:bg-white/10 transition"
            >
              <Bell className="h-5 w-5" />
              <span className="font-medium">Insider Alerts</span>
            </Link>

            <button
              onClick={() => alert("Daily Brief is delivered via email. Sign up to receive it!")}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 hover:bg-white/10 transition"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Daily Brief</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 hover:bg-white/10 transition"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="font-medium">{showMore ? "Less" : "More"}</span>
              </button>

              {/* Expanded More Menu */}
              {showMore && (
                <div className="absolute top-full mt-2 left-0 w-48 rounded-xl border border-white/10 bg-neutral-900/95 backdrop-blur-sm py-2 shadow-xl">
                  <Link
                    href="/insights"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
                  >
                    <Lightbulb className="h-5 w-5" />
                    <span className="font-medium">Weekly Insights</span>
                  </Link>
                  <Link
                    href="/lists"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition"
                  >
                    <List className="h-5 w-5" />
                    <span className="font-medium">Lists</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <button className="fixed bottom-6 right-6 z-50 rounded-full border border-white/10 bg-neutral-900/80 p-3 backdrop-blur-sm hover:bg-white/10 transition">
        <HelpCircle className="h-6 w-6" />
      </button>
    </main>
  );
}
