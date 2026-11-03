"use client";

import { useState } from "react";
import {
  FlaskConical,
  Play,
  RotateCcw,
  TrendingUp,
  Percent,
  BarChart2,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { formatINR } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

export default function StrategyLabPage() {
  const [strategyId, setStrategyId] = useState<string>("MA_CROSSOVER");
  const [symbol, setSymbol] = useState<string>("RELIANCE");
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [days, setDays] = useState<number>(180);
  const [brokerage, setBrokerage] = useState<number>(20);
  const [fastPeriod, setFastPeriod] = useState<number>(20);
  const [slowPeriod, setSlowPeriod] = useState<number>(50);

  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/backtests/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_id: strategyId,
          symbol: symbol.toUpperCase(),
          timeframe: "1d",
          days,
          initial_capital: initialCapital,
          brokerage_per_order: brokerage,
          slippage_pct: 0.05,
          parameters: {
            fast_period: fastPeriod,
            slow_period: slowPeriod,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Backtest failed");
      }

      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to execute backtest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-surface-200 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Quantitative Strategy Lab</h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            EVENT-DRIVEN BACKTESTER
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Simulate rule-based algorithmic strategies against historical Indian stock data with zero look-ahead bias and realistic STT/brokerage deductions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Strategy Configuration Form */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-surface-200 border border-border h-fit space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Configuration
          </h2>

          <form onSubmit={handleRunBacktest} className="space-y-3.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Strategy</label>
              <select
                value={strategyId}
                onChange={(e) => setStrategyId(e.target.value)}
                className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="MA_CROSSOVER">Moving Average Crossover</option>
                <option value="RSI_MEAN_REVERSION">RSI Mean Reversion (30/70)</option>
                <option value="MACD_CROSSOVER">MACD Signal Crossover</option>
                <option value="BOLLINGER_BAND">Bollinger Volatility Bounce</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Stock Symbol (NSE)</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Initial Capital</label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Days History</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {strategyId === "MA_CROSSOVER" && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Fast MA (Period)</label>
                  <input
                    type="number"
                    value={fastPeriod}
                    onChange={(e) => setFastPeriod(Number(e.target.value))}
                    className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Slow MA (Period)</label>
                  <input
                    type="number"
                    value={slowPeriod}
                    onChange={(e) => setSlowPeriod(Number(e.target.value))}
                    className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <label className="text-[10px] text-slate-400 block mb-1">Brokerage per Order (₹)</label>
              <input
                type="number"
                value={brokerage}
                onChange={(e) => setBrokerage(Number(e.target.value))}
                className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-xs font-bold hover:brightness-110 shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Simulating Trades...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Run Quantitative Backtest</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 3 Columns: Backtest Results & Tearsheet */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {!results && !loading && (
            <div className="p-16 rounded-2xl bg-surface-200 border border-border text-center">
              <FlaskConical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Backtest Executed Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Configure your strategy parameters on the left and click "Run Quantitative Backtest" to generate execution metrics.
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Performance Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-surface-200 border border-border">
                  <div className="text-[10px] text-slate-400">Net Profit / Loss</div>
                  <div
                    className={`text-lg font-black font-mono mt-1 ${
                      results.net_pnl >= 0 ? "text-bullish" : "text-bearish"
                    }`}
                  >
                    {formatINR(results.net_pnl)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Return: {results.total_return_pct}%
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-200 border border-border">
                  <div className="text-[10px] text-slate-400">Win Rate</div>
                  <div className="text-lg font-black text-cyan-400 font-mono mt-1">
                    {results.win_rate_pct}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {results.winning_trades} Wins / {results.losing_trades} Losses
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-200 border border-border">
                  <div className="text-[10px] text-slate-400">Max Drawdown</div>
                  <div className="text-lg font-black text-rose-400 font-mono mt-1">
                    {results.max_drawdown_pct}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Peak to trough risk</div>
                </div>

                <div className="p-4 rounded-xl bg-surface-200 border border-border">
                  <div className="text-[10px] text-slate-400">Sharpe Ratio</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-1">
                    {results.sharpe_ratio}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Total STT/Fees: {formatINR(results.total_charges)}
                  </div>
                </div>
              </div>

              {/* Equity Curve Chart */}
              <div className="p-5 rounded-2xl bg-surface-200 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-cyan-400" /> Equity Curve vs Buy & Hold Benchmark
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {results.start_date} to {results.end_date}
                  </span>
                </div>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.equity_curve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} domain={["auto", "auto"]} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0d1322", borderColor: "#1e293b", fontSize: "11px" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="portfolio_value"
                        name="Strategy Equity (₹)"
                        stroke="#00e5ff"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark_value"
                        name="Buy & Hold (₹)"
                        stroke="#64748b"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trade Log Table */}
              <div className="p-5 rounded-2xl bg-surface-200 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Executed Trade Log ({results.trades.length} Trades)
                  </span>
                </div>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-100 text-slate-400 border-b border-border sticky top-0">
                      <tr>
                        <th className="p-2">Entry Date</th>
                        <th className="p-2">Exit Date</th>
                        <th className="p-2">Shares</th>
                        <th className="p-2">Entry ₹</th>
                        <th className="p-2">Exit ₹</th>
                        <th className="p-2">Net P&L</th>
                        <th className="p-2">Return %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.trades.map((t: any, idx: number) => {
                        const isWin = t.net_pnl > 0;
                        return (
                          <tr key={idx} className="hover:bg-surface-100/50">
                            <td className="p-2 text-slate-300">{t.entry_date}</td>
                            <td className="p-2 text-slate-300">{t.exit_date}</td>
                            <td className="p-2 text-white">{t.shares}</td>
                            <td className="p-2 text-slate-300">₹{t.entry_price.toFixed(2)}</td>
                            <td className="p-2 text-slate-300">₹{t.exit_price.toFixed(2)}</td>
                            <td className={`p-2 font-bold ${isWin ? "text-bullish" : "text-bearish"}`}>
                              {formatINR(t.net_pnl)}
                            </td>
                            <td className={`p-2 font-bold ${isWin ? "text-bullish" : "text-bearish"}`}>
                              {t.return_pct > 0 ? "+" : ""}
                              {t.return_pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
