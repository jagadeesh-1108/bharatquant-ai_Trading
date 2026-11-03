"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Search, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import Link from "next/link";
import { formatINR, formatPercent } from "@/lib/utils";

export default function MarketExplorerPage() {
  const [overview, setOverview] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("http://127.0.0.1:8000/api/v1/market/overview");
        if (res.ok) setOverview(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allStocks = [
    ...(overview?.top_gainers || []),
    ...(overview?.top_losers || []),
    ...(overview?.most_active || []),
  ].filter((v, i, a) => a.findIndex((t) => t.symbol === v.symbol) === i);

  const filtered = allStocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.company_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-surface-200 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" /> Market Explorer (NSE / BSE)
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive screening across Indian equities, market breadth, and volume leaders.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter stocks by name or symbol..."
            className="w-full bg-surface-100 border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Indices Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {(overview?.indices || []).map((idx: any) => {
          const isUp = idx.change >= 0;
          return (
            <div key={idx.symbol} className="p-3.5 rounded-xl bg-surface-200 border border-border">
              <div className="text-[11px] text-slate-400 font-medium truncate">{idx.name}</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{idx.value.toLocaleString("en-IN")}</div>
              <div className={`flex items-center text-[10px] font-bold mt-1 ${isUp ? "text-bullish" : "text-bearish"}`}>
                {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                <span>{formatPercent(idx.change_percent)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtered Stocks Table */}
      <div className="p-5 rounded-2xl bg-surface-200 border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            All Tracked Instruments ({filtered.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Status: DEMO ENGINE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-100 text-slate-400 border-b border-border">
              <tr>
                <th className="p-3">Symbol</th>
                <th className="p-3">Company Name</th>
                <th className="p-3">Exchange</th>
                <th className="p-3">Last Price</th>
                <th className="p-3">Change (₹)</th>
                <th className="p-3">Change (%)</th>
                <th className="p-3">Volume</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((stock) => {
                const isUp = stock.change >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-surface-100/50">
                    <td className="p-3 font-bold text-white">{stock.symbol}</td>
                    <td className="p-3 text-slate-300 font-sans">{stock.company_name}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded bg-surface-100 text-slate-400 text-[10px]">
                        {stock.exchange}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">₹{stock.last_price.toFixed(2)}</td>
                    <td className={`p-3 font-semibold ${isUp ? "text-bullish" : "text-bearish"}`}>
                      {stock.change > 0 ? "+" : ""}
                      {stock.change.toFixed(2)}
                    </td>
                    <td className={`p-3 font-bold ${isUp ? "text-bullish" : "text-bearish"}`}>
                      {formatPercent(stock.change_percent)}
                    </td>
                    <td className="p-3 text-slate-300">{stock.volume.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/analyst?symbol=${stock.symbol}`}
                        className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-bold border border-border hover:border-cyan-500/40 transition-all inline-block"
                      >
                        Analyze
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
