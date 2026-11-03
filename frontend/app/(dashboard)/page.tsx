"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  Radio,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  ChevronRight,
  Activity
} from "lucide-react";
import { formatINR, formatPercent } from "@/lib/utils";
import TradingViewChart from "@/components/charts/TradingViewChart";
import { API_BASE_URL } from "@/lib/api";

export default function OverviewDashboard() {
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [candles, setCandles] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>("RELIANCE");
  const [paperAccount, setPaperAccount] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // 1. Fetch Market Overview
        const ovRes = await fetch(`${API_BASE_URL}/market/overview`);
        if (ovRes.ok) setMarketOverview(await ovRes.json());

        // 2. Fetch Trading Signals
        const sigRes = await fetch(`${API_BASE_URL}/signals?limit=4`);
        if (sigRes.ok) setSignals(await sigRes.json());

        // 3. Fetch Paper Account Snapshot
        const accRes = await fetch(`${API_BASE_URL}/paper/account`);
        if (accRes.ok) setPaperAccount(await accRes.json());

        // 4. Fetch Stock Candles for Chart
        const chartRes = await fetch(`${API_BASE_URL}/market/stocks/${selectedStock}/history?days=120`);
        if (chartRes.ok) setCandles(await chartRes.json());
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [selectedStock]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-surface-100 via-surface-200 to-cyan-950/30 border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Market Intelligence Terminal</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              v1.0 QUANT
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time algorithmic scanning, evidence-grounded AI stock insights, and virtual risk-managed trading.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/analyst?symbol=RELIANCE"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 border border-border text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>AI Analyst</span>
          </Link>
          <Link
            href="/strategy-lab"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 border border-border text-xs font-semibold text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Backtest Lab</span>
          </Link>
        </div>
      </div>

      {/* Primary Indices Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(marketOverview?.indices || [
          { name: "NIFTY 50", value: 24850.2, change: 112.4, change_percent: 0.45 },
          { name: "SENSEX", value: 81500.4, change: 340.8, change_percent: 0.42 },
          { name: "BANK NIFTY", value: 52340.6, change: -85.2, change_percent: -0.16 },
          { name: "NIFTY IT", value: 42150.1, change: 260.5, change_percent: 0.62 },
          { name: "NIFTY AUTO", value: 25480.9, change: 180.3, change_percent: 0.71 },
          { name: "NIFTY PHARMA", value: 22910.3, change: -45.1, change_percent: -0.2 },
        ]).map((idx: any) => {
          const isUp = idx.change >= 0;
          return (
            <div key={idx.name} className="p-3.5 rounded-xl bg-surface-200 border border-border hover:border-slate-700 transition-all">
              <div className="text-[11px] font-medium text-slate-400 truncate mb-1">{idx.name}</div>
              <div className="text-sm font-bold text-white font-mono">{idx.value.toLocaleString("en-IN")}</div>
              <div className={`flex items-center text-[10px] font-semibold mt-1 ${isUp ? "text-bullish" : "text-bearish"}`}>
                {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                <span>{formatPercent(idx.change_percent)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Interactive Chart + Portfolio / Signal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Candlestick Chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stock Selector Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC"].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedStock(sym)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedStock === sym
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-surface-200 text-slate-400 border border-border hover:text-white"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          <TradingViewChart data={candles} symbol={selectedStock} />

          {/* Gainers & Losers Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Gainers */}
            <div className="p-4 rounded-xl bg-surface-200 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-bullish" /> Top Gainers (NSE)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Today</span>
              </div>
              <div className="space-y-2">
                {(marketOverview?.top_gainers || []).slice(0, 4).map((g: any) => (
                  <div
                    key={g.symbol}
                    onClick={() => setSelectedStock(g.symbol)}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-100 hover:bg-surface-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white font-mono">{g.symbol}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{g.company_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-white">₹{g.last_price.toFixed(2)}</div>
                      <div className="text-[10px] font-bold text-bullish">+{g.change_percent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="p-4 rounded-xl bg-surface-200 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-bearish" /> Top Losers (NSE)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Today</span>
              </div>
              <div className="space-y-2">
                {(marketOverview?.top_losers || []).slice(0, 4).map((l: any) => (
                  <div
                    key={l.symbol}
                    onClick={() => setSelectedStock(l.symbol)}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-100 hover:bg-surface-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white font-mono">{l.symbol}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{l.company_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-white">₹{l.last_price.toFixed(2)}</div>
                      <div className="text-[10px] font-bold text-bearish">{l.change_percent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Paper Trading Snapshot & AI Research Signals */}
        <div className="space-y-5">
          {/* Virtual Account Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-surface-200 via-surface-100 to-slate-900 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-cyan-400" /> Virtual Paper Portfolio
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                SIMULATED
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {formatINR(paperAccount?.total_portfolio_value || 100000)}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
              <div>
                <div className="text-[10px] text-slate-500">Available Cash</div>
                <div className="text-xs font-bold text-slate-200 font-mono">
                  {formatINR(paperAccount?.available_cash || 100000)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Total P&L</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  {formatINR(paperAccount?.total_pnl || 0)} ({paperAccount?.total_pnl_pct || "0.00"}%)
                </div>
              </div>
            </div>
            <Link
              href="/paper-trading"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-surface-50 hover:bg-slate-800 text-xs font-bold text-white border border-border transition-all"
            >
              <span>Manage Virtual Positions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AI Trading Signals Snapshot */}
          <div className="p-5 rounded-2xl bg-surface-200 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Algorithmic Signals</h3>
              </div>
              <Link href="/signals" className="text-[10px] text-cyan-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {signals.map((sig) => {
                const isBuy = sig.signal_type.includes("BUY");
                const isSell = sig.signal_type.includes("SELL");
                return (
                  <div key={sig.id} className="p-3 rounded-xl bg-surface-100 border border-border/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white font-mono text-xs">{sig.symbol}</span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                          isBuy
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : isSell
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {sig.signal_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {sig.signal_explanation}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>RSI: {sig.supporting_indicators?.rsi_14 || "N/A"}</span>
                      <span>Target: ₹{sig.target_price || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Assistant Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-950/40 via-surface-200 to-surface-100 border border-purple-900/40">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Ask BharatQuant Copilot</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Get evidence-grounded technical breakdowns for any Indian stock without hallucinations.
            </p>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all"
            >
              <span>Start Analysis Session</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
