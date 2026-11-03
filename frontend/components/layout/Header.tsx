"use client";

import { useState } from "react";
import { Search, Bell, ShieldCheck, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onSearchSelect?: (symbol: string) => void;
}

export default function Header({ onSearchSelect }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const res = await fetch(`http://127.0.0.1:8000/api/v1/market/stocks/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch {
      // offline / mock search fallback
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-surface-200/90 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Global Stock Search */}
      <div className="relative w-80">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search Reliance, TCS, INFY, Nifty..."
            className="w-full bg-surface-100 border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full bg-surface-100 border border-border rounded-lg shadow-2xl overflow-hidden z-50">
            {searchResults.map((stock) => (
              <Link
                key={stock.symbol}
                href={`/analyst?symbol=${stock.symbol}`}
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  onSearchSelect?.(stock.symbol);
                }}
                className="flex items-center justify-between px-3 py-2 text-xs hover:bg-surface-50 border-b border-border/50 last:border-b-0"
              >
                <div>
                  <span className="font-bold text-white mr-2">{stock.symbol}</span>
                  <span className="text-[10px] text-slate-400">{stock.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {stock.exchange}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Market Status & Data Tags */}
      <div className="flex items-center gap-4">
        {/* Data Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-100 border border-border text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 font-medium">MARKET:</span>
          <span className="text-emerald-400 font-semibold">NSE LIVE</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950/70 border border-amber-800/80">
            DEMO DATA ENGINE
          </span>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/paper-trading"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-xs font-bold hover:brightness-110 shadow-lg shadow-cyan-500/10 transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>New Virtual Trade</span>
        </Link>
      </div>
    </header>
  );
}
