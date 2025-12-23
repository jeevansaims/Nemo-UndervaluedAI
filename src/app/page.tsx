"use client";

import { useState, useRef, useEffect } from "react";
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
import { searchTickers } from "@/lib/search/tickerSearch";

export default function HomePage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ ticker: string; name: string }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTicker(value);
    
    if (value.trim()) {
      const results = searchTickers(value);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Handle ticker selection
  const handleSelectTicker = (selectedTicker: string) => {
    setTicker("");
    setShowDropdown(false);
    router.push(`/ai-analysis?ticker=${selectedTicker}`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) {
      if (e.key ===  "Enter" && ticker.trim()) {
        e.preventDefault();
        handleSelectTicker(ticker.toUpperCase());
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectTicker(searchResults[selectedIndex].ticker);
        } else if (ticker.trim()) {
          handleSelectTicker(ticker.toUpperCase());
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <strong key={i}>{part}</strong> : part
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#232323] text-white overflow-hidden">
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

          {/* Search Bar with Dropdown */}
          <div ref={searchRef} className="relative">
            <div className="relative">
              <input
                type="text"
                value={ticker}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ticker or Company..."
                className="w-full rounded-full border border-white/10 bg-[#313131] px-6 py-3.5 text-center text-lg placeholder:text-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={() => ticker.trim() && handleSelectTicker(ticker.toUpperCase())}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/60 hover:text-white transition"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full rounded-xl border border-[#404040] bg-[#232323] py-2 shadow-xl max-h-60 overflow-y-auto z-50">
                {searchResults.map((result, index) => (
                  <div
                    key={result.ticker}
                    onClick={() => handleSelectTicker(result.ticker)}
                    className={`px-4 py-3 cursor-pointer transition ${
                      index === selectedIndex ? "bg-[#313131]" : "hover:bg-white/5"
                    }`}
                  >
                    {highlightMatch(result.ticker, ticker)} -{" "}
                    {highlightMatch(result.name, ticker)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/funds"
              className="flex items-center gap-2 rounded-full border border-[#404040] bg-[#232323] px-5 py-3 hover:bg-[#313131] transition"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">AI Funds</span>
            </Link>

            <Link
              href="/alerts"
              className="flex items-center gap-2 rounded-full border border-[#404040] bg-[#232323] px-5 py-3 hover:bg-[#313131] transition"
            >
              <Bell className="h-5 w-5" />
              <span className="font-medium">Insider Alerts</span>
            </Link>

            <button
              onClick={() => alert("Daily Brief is delivered via email. Sign up to receive it!")}
              className="flex items-center gap-2 rounded-full border border-[#404040] bg-[#232323] px-5 py-3 hover:bg-[#313131] transition"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Daily Brief</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-2 rounded-full border border-[#404040] bg-[#232323] px-5 py-3 hover:bg-[#313131] transition"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="font-medium">{showMore ? "Less" : "More"}</span>
              </button>

              {/* Expanded More Menu */}
              {showMore && (
                <div className="absolute top-full mt-2 left-0 w-48 rounded-xl border border-[#404040] bg-[#232323] py-2 shadow-xl">
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
      <button className="fixed bottom-6 right-6 z-50 rounded-full border border-[#404040] bg-[#232323] p-3 hover:bg-[#313131] transition">
        <HelpCircle className="h-6 w-6" />
      </button>
    </main>
  );
}
