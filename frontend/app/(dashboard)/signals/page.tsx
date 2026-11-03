"use client";

import { useState, useEffect } from "react";
import {
  Radio,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Sparkles,
  Activity,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

export default function TradingSignalsPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSignals() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/signals?limit=12`);
        if (res.ok) setSignals(await res.json());
      } catch (err) {
        console.error("Failed to load trading signals:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSignals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-surface-200 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h1 className="text-xl font-bold text-white tracking-tight">AI Trading Signal Generator</h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            DETERMINISTIC QUANT ENGINE
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Algorithmic multi-factor signal synthesis evaluating trend (EMA 9/21), momentum (RSI, MACD), and volatility (ATR, Bollinger Bands).
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-surface-200 border border-border rounded-2xl">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Scanning Indian stock universe for technical setups...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {signals.map((sig) => {
            const isBuy = sig.signal_type.includes("BUY");
            const isSell = sig.signal_type.includes("SELL");
            const isHold = sig.signal_type.includes("HOLD");

            return (
              <div
                key={sig.id}
                className="p-5 rounded-2xl bg-surface-200 border border-border hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white font-mono">{sig.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 text-slate-400 font-mono">
                        {sig.exchange}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md ${
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

                  {/* Price & Target Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-100 border border-border/80 text-center font-mono mb-4">
                    <div>
                      <div className="text-[9px] text-slate-500">Current</div>
                      <div className="text-xs font-bold text-white">₹{sig.current_price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500">Target</div>
                      <div className="text-xs font-bold text-cyan-400">
                        {sig.target_price ? `₹${sig.target_price.toFixed(2)}` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500">Stop Loss</div>
                      <div className="text-xs font-bold text-rose-400">
                        {sig.stop_loss_invalidation ? `₹${sig.stop_loss_invalidation.toFixed(2)}` : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Signal Explanation */}
                  <div className="text-xs text-slate-300 leading-relaxed mb-4">
                    {sig.signal_explanation}
                  </div>

                  {/* Supporting Indicators */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mb-4 pb-3 border-b border-border">
                    <span>RSI: {sig.supporting_indicators?.rsi_14 || "N/A"}</span>
                    <span>ATR: ₹{sig.supporting_indicators?.atr_14 || "N/A"}</span>
                    <span>Vol: {sig.supporting_indicators?.volatility_pct || "N/A"}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] text-slate-500 font-mono">
                    Score: {sig.confidence_score}%
                  </div>
                  <Link
                    href={`/analyst?symbol=${sig.symbol}`}
                    className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:underline"
                  >
                    <span>Full Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
