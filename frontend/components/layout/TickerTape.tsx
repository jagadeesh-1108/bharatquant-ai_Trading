"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatINR, formatPercent } from "@/lib/utils";

export default function TickerTape() {
  const [indices, setIndices] = useState<any[]>([
    { name: "NIFTY 50", value: 24850.2, change: 112.4, change_percent: 0.45 },
    { name: "SENSEX", value: 81500.4, change: 340.8, change_percent: 0.42 },
    { name: "BANK NIFTY", value: 52340.6, change: -85.2, change_percent: -0.16 },
    { name: "NIFTY IT", value: 42150.1, change: 260.5, change_percent: 0.62 },
    { name: "NIFTY AUTO", value: 25480.9, change: 180.3, change_percent: 0.71 },
    { name: "NIFTY PHARMA", value: 22910.3, change: -45.1, change_percent: -0.2 },
  ]);

  useEffect(() => {
    async function fetchIndices() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/market/indices");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) setIndices(data);
        }
      } catch {
        // Fallback to initial mock indices
      }
    }
    fetchIndices();
    const interval = setInterval(fetchIndices, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-8 bg-surface-100 border-b border-border flex items-center overflow-hidden px-4 text-xs font-mono select-none">
      <div className="flex items-center gap-6 whitespace-nowrap animate-none">
        {indices.map((idx) => {
          const isPositive = idx.change >= 0;
          return (
            <div key={idx.name} className="flex items-center gap-2">
              <span className="font-bold text-slate-300">{idx.name}</span>
              <span className="text-white font-medium">{idx.value.toLocaleString("en-IN")}</span>
              <span
                className={`flex items-center text-[11px] font-semibold ${
                  isPositive ? "text-bullish" : "text-bearish"
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                {formatPercent(idx.change_percent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
