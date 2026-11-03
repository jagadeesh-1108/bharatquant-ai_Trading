"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Activity
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

function AIStockAnalystContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "RELIANCE";

  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [searchInput, setSearchInput] = useState<string>("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalysis = async (sym: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym.toUpperCase(), exchange: "NSE" }),
      });
      if (res.ok) {
        setReport(await res.json());
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(symbol);
  }, [symbol]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
      setSearchInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-200 border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">AI Stock Research Analyst</h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              EVIDENCE-GROUNDED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated quantitative screening synthesized into natural language research without financial hallucinations.
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Analyze symbol (e.g. TCS)..."
            className="bg-surface-100 border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Symbol Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC", "BHARTIARTL", "TATAMOTORS"].map((sym) => (
          <button
            key={sym}
            onClick={() => setSymbol(sym)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              symbol === sym
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-surface-200 text-slate-400 border border-border hover:text-white"
            }`}
          >
            {sym}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center bg-surface-200 border border-border rounded-2xl">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Synthesizing quantitative indicators and AI research report...</p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-r from-surface-100 to-surface-200 border border-border">
            <div>
              <div className="text-[11px] text-slate-400">Stock Symbol</div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">{report.symbol}</div>
              <div className="text-[10px] text-slate-500 mt-1">NSE Equity • As of {report.as_of_date}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Current Market Price</div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">{formatINR(report.current_price)}</div>
              <div className="text-[10px] text-cyan-400 mt-1">Status: {report.data_status}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Quantitative Bias</div>
              <div className="mt-1">
                <span
                  className={`text-sm font-extrabold px-2.5 py-1 rounded-md ${
                    report.overall_sentiment === "BULLISH"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : report.overall_sentiment === "BEARISH"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {report.overall_sentiment}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">EMA 9/21: {report.technical_summary.ema_bias}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">RSI & Volatility</div>
              <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">
                RSI: {report.technical_summary.rsi_14}
              </div>
              <div className="text-[10px] text-amber-400 mt-1 font-mono">
                Annual Vol: {report.technical_summary.volatility_annualized}%
              </div>
            </div>
          </div>

          {/* AI Synthesis Executive Markdown */}
          <div className="p-6 rounded-2xl bg-surface-200 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Executive Synthesis</h3>
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono ml-auto">
                Model: {report.model_used}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{report.full_report_markdown}</p>
          </div>

          {/* Bullish vs Bearish Quantitative Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bullish Observations */}
            <div className="p-5 rounded-2xl bg-surface-200 border border-border">
              <div className="flex items-center gap-2 mb-4 text-bullish font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Supporting Bullish Catalysts</span>
              </div>
              <ul className="space-y-2.5">
                {report.bullish_factors.map((factor: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-bullish mt-1.5 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bearish Observations */}
            <div className="p-5 rounded-2xl bg-surface-200 border border-border">
              <div className="flex items-center gap-2 mb-4 text-bearish font-bold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4" />
                <span>Bearish Pressures & Resistance</span>
              </div>
              <ul className="space-y-2.5">
                {report.bearish_factors.map((factor: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-bearish mt-1.5 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Factors & Disclaimers */}
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/40">
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Risk Factors & Invalidation Bounds</span>
            </div>
            <ul className="space-y-2 mb-4">
              {report.risk_factors.map((risk: string, i: number) => (
                <li key={i} className="text-xs text-amber-200/90 flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-amber-900/40 text-[10px] text-amber-300/70">
              {report.disclaimer}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AIStockAnalystPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Analyst...</div>}>
      <AIStockAnalystContent />
    </Suspense>
  );
}
