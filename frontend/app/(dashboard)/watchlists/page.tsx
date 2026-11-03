"use client";

import { useState, useEffect } from "react";
import { Eye, Bell, Plus, Trash2, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { formatINR, formatPercent } from "@/lib/utils";
import Link from "next/link";

export default function WatchlistsAndAlertsPage() {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Alert State
  const [alertSymbol, setAlertSymbol] = useState("RELIANCE");
  const [alertType, setAlertType] = useState("PRICE_ABOVE");
  const [threshold, setThreshold] = useState<number>(3100);
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [wlRes, altRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/v1/watchlists"),
        fetch("http://127.0.0.1:8000/api/v1/alerts"),
      ]);
      if (wlRes.ok) setWatchlists(await wlRes.json());
      if (altRes.ok) setAlerts(await altRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: alertSymbol.toUpperCase(),
          exchange: "NSE",
          alert_type: alertType,
          threshold_value: Number(threshold),
          notes,
        }),
      });
      if (res.ok) {
        setNotes("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/alerts/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-surface-200 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Smart Watchlists & Trigger Alerts</h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            MONITORING ENGINE
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Track high-conviction Indian equities with automated indicator triggers for RSI, Moving Averages, and Price breakouts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Section (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-surface-200 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" /> Core Watchlist
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5 Symbols Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-100 text-slate-400 border-b border-border">
                  <tr>
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Last Price</th>
                    <th className="p-3">Change %</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(watchlists[0]?.items || []).map((item: any) => {
                    const isUp = (item.change_percent || 0) >= 0;
                    return (
                      <tr key={item.id} className="hover:bg-surface-100/50">
                        <td className="p-3 font-bold text-white">{item.symbol}</td>
                        <td className="p-3 text-slate-300 font-sans">{item.company_name}</td>
                        <td className="p-3 font-semibold text-white">₹{item.last_price?.toFixed(2) || "—"}</td>
                        <td className={`p-3 font-bold ${isUp ? "text-bullish" : "text-bearish"}`}>
                          {formatPercent(item.change_percent || 0)}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/analyst?symbol=${item.symbol}`}
                            className="px-2 py-1 rounded bg-surface-100 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-border"
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

        {/* Alerts Configuration & List (Right Col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface-200 border border-border space-y-3.5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Create Indicator Alert
            </h2>

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Symbol</label>
                <input
                  type="text"
                  value={alertSymbol}
                  onChange={(e) => setAlertSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-surface-100 border border-border rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Alert Condition</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="PRICE_ABOVE">Price Crosses Above</option>
                  <option value="PRICE_BELOW">Price Drops Below</option>
                  <option value="RSI_OVERBOUGHT">RSI Crosses Overbought (70)</option>
                  <option value="RSI_OVERSOLD">RSI Drops Oversold (30)</option>
                  <option value="MA_CROSSOVER">Moving Average Crossover</option>
                  <option value="VOLUME_SPIKE">Volume 2x Spike</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Threshold Value</label>
                <input
                  type="number"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full bg-surface-100 border border-border rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Notes / Strategy Memo</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Resistance breakout test"
                  className="w-full bg-surface-100 border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/10"
              >
                Set Alert Trigger
              </button>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="p-5 rounded-2xl bg-surface-200 border border-border space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Active Triggers ({alerts.length})
            </span>
            <div className="space-y-2">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-3 rounded-xl bg-surface-100 border border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-xs">{alt.symbol}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                        {alt.alert_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Target: ₹{alt.threshold_value} • {alt.notes || "No notes"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alt.id)}
                    className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
