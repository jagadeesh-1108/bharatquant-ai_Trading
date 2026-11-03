"use client";

import { useState } from "react";
import { Settings, Shield, Key, Database, Cpu, Lock, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [dataMode, setDataMode] = useState("MOCK");
  const [broker, setBroker] = useState("NONE");
  const [aiProvider, setAiProvider] = useState("anthropic");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-5 rounded-2xl bg-surface-200 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">System & Broker Integration Settings</h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            CONFIGURATION
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Configure market data sources, broker connection adapters, AI quantitative LLM models, and safety thresholds.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Market Data Provider Card */}
        <div className="p-5 rounded-2xl bg-surface-200 border border-border space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" /> Market Data Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: "MOCK", title: "High-Fidelity Mock Engine", desc: "Simulated NSE/BSE historical OHLCV data. 100% offline & safe." },
              { id: "YFINANCE", title: "Yahoo Finance (.NS / .BO)", desc: "Community daily historical candles. Read-only delayed data." },
              { id: "LIVE_BROKER", title: "Authorized Broker API", desc: "Direct WebSocket/REST feed via Upstox or Dhan. Requires active Demat API key." },
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={() => setDataMode(mode.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  dataMode === mode.id
                    ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                    : "bg-surface-100 border-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-bold mb-1 flex items-center justify-between">
                  <span>{mode.title}</span>
                  {dataMode === mode.id && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-400">{mode.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Indian Broker Integration Architecture Card */}
        <div className="p-5 rounded-2xl bg-surface-200 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Indian Broker Connection (SEBI Regulated)
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              LIVE ORDERS DISABLED
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select an authorized Indian broker adapter. In accordance with safety rules, automated live order execution remains strictly disabled.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { id: "NONE", name: "Paper Trading Only", status: "Active (₹1,00,000)" },
              { id: "UPSTOX", name: "Upstox API v2", status: "Market Data Ready" },
              { id: "DHAN", name: "Dhan HQ API", status: "Adapter Available" },
              { id: "ZERODHA", name: "Kite Connect", status: "Manual Key Req." },
            ].map((b) => (
              <div
                key={b.id}
                onClick={() => setBroker(b.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  broker === b.id
                    ? "bg-amber-500/10 border-amber-500/50 text-white"
                    : "bg-surface-100 border-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-bold mb-0.5">{b.name}</div>
                <div className="text-[10px] text-slate-500">{b.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Engine Model Selection */}
        <div className="p-5 rounded-2xl bg-surface-200 border border-border space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> AI Quantitative LLM Provider
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                id: "anthropic",
                name: "Anthropic Claude 3.5 Sonnet",
                desc: "Elite reasoning for quantitative synthesis, risk breakdown, and financial nuance.",
              },
              {
                id: "openai",
                name: "OpenAI GPT-4o",
                desc: "Fast multimodal financial conversational processing.",
              },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setAiProvider(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  aiProvider === p.id
                    ? "bg-purple-500/10 border-purple-500/50 text-white"
                    : "bg-surface-100 border-border text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-bold mb-1 flex items-center justify-between">
                  <span>{p.name}</span>
                  {aiProvider === p.id && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-400">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/10"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
}
