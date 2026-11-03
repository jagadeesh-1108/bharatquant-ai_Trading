"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  PlusCircle,
  Clock,
  Receipt,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { formatINR, formatPercent } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

export default function PaperTradingPage() {
  const [account, setAccount] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Order Ticket State
  const [symbol, setSymbol] = useState<string>("RELIANCE");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [quantity, setQuantity] = useState<number>(5);
  const [limitPrice, setLimitPrice] = useState<number | undefined>(undefined);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accRes, holdRes, ordRes, txnRes] = await Promise.all([
        fetch(`${API_BASE_URL}/paper/account`),
        fetch(`${API_BASE_URL}/paper/holdings`),
        fetch(`${API_BASE_URL}/paper/orders`),
        fetch(`${API_BASE_URL}/paper/transactions`),
      ]);

      if (accRes.ok) setAccount(await accRes.json());
      if (holdRes.ok) setHoldings(await holdRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (txnRes.ok) setTransactions(await txnRes.json());
    } catch (err) {
      console.error("Paper trading data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/paper/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          exchange: "NSE",
          side,
          order_type: orderType,
          quantity,
          limit_price: orderType === "LIMIT" ? limitPrice : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Failed to execute order");
      }

      const executed = await res.json();
      setOrderMessage(`Order Executed: ${executed.side} ${executed.quantity} ${executed.symbol} @ ₹${executed.executed_price.toFixed(2)}`);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Order submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset your virtual trading account back to ₹1,00,000? All virtual holdings will be cleared.")) {
      try {
        await fetch(`${API_BASE_URL}/paper/reset`, { method: "POST" });
        loadData();
      } catch (err) {
        console.error("Reset failed:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-200 border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Paper Trading Environment</h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              SIMULATED CNC (NSE)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Practice risk management and algorithmic strategy execution with a virtual ₹1,00,000 cash balance.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-slate-800 border border-border text-xs font-semibold text-slate-300 hover:text-white transition-all self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset Account</span>
        </button>
      </div>

      {/* Account Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">Total Portfolio Value</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {formatINR(account?.total_portfolio_value || 100000)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cash + Equity Holdings</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">Available Virtual Cash</div>
          <div className="text-xl font-black text-cyan-400 font-mono mt-1">
            {formatINR(account?.available_cash || 100000)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ready for deployment</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">Invested in Equities</div>
          <div className="text-xl font-black text-slate-200 font-mono mt-1">
            {formatINR(account?.invested_amount || 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{holdings.length} Active Positions</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">Total Virtual P&L</div>
          <div
            className={`text-xl font-black font-mono mt-1 ${
              (account?.total_pnl || 0) >= 0 ? "text-bullish" : "text-bearish"
            }`}
          >
            {formatINR(account?.total_pnl || 0)}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
            Return: {account?.total_pnl_pct || "0.00"}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Ticket */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-surface-200 border border-border space-y-4 h-fit">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-cyan-400" /> Virtual Order Ticket
          </h2>

          {orderMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{orderMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-3.5">
            {/* BUY / SELL Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-100 border border-border">
              <button
                type="button"
                onClick={() => setSide("BUY")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  side === "BUY"
                    ? "bg-bullish text-black shadow-md shadow-bullish/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                BUY (CNC)
              </button>
              <button
                type="button"
                onClick={() => setSide("SELL")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  side === "SELL"
                    ? "bg-bearish text-white shadow-md shadow-bearish/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                SELL
              </button>
            </div>

            {/* Symbol */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Symbol (NSE)</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="RELIANCE, TCS..."
                className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Order Type & Quantity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e: any) => setOrderType(e.target.value)}
                  className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="MARKET">Market</option>
                  <option value="LIMIT">Limit</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-surface-100 border border-border rounded-lg px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {orderType === "LIMIT" && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Limit Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={limitPrice || ""}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  placeholder="Enter limit price..."
                  className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-surface-100 border border-border text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Brokerage:</span>
                <span className="font-mono text-white">₹20.00</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>STT Simulation:</span>
                <span className="font-mono text-white">{side === "SELL" ? "0.1% (₹)" : "₹0.00"}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                side === "BUY"
                  ? "bg-bullish hover:brightness-110 text-black shadow-lg shadow-bullish/10"
                  : "bg-bearish hover:brightness-110 text-white shadow-lg shadow-bearish/10"
              }`}
            >
              {isSubmitting ? "Executing..." : `Submit Simulated ${side} Order`}
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Holdings & Order Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Holdings Table */}
          <div className="p-5 rounded-2xl bg-surface-200 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Active Holdings ({holdings.length})
              </span>
            </div>

            {holdings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                No active stock holdings. Use the order ticket on the left to purchase virtual shares.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-100 text-slate-400 border-b border-border">
                    <tr>
                      <th className="p-2.5">Symbol</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Avg Buy ₹</th>
                      <th className="p-2.5">Current ₹</th>
                      <th className="p-2.5">Market Value</th>
                      <th className="p-2.5">Unrealized P&L</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {holdings.map((h) => {
                      const isUp = h.unrealized_pnl >= 0;
                      return (
                        <tr key={h.symbol} className="hover:bg-surface-100/50">
                          <td className="p-2.5 font-bold text-white">{h.symbol}</td>
                          <td className="p-2.5 text-slate-200">{h.quantity}</td>
                          <td className="p-2.5 text-slate-300">₹{h.average_buy_price.toFixed(2)}</td>
                          <td className="p-2.5 text-slate-300">₹{h.current_price.toFixed(2)}</td>
                          <td className="p-2.5 font-semibold text-white">{formatINR(h.current_value)}</td>
                          <td className={`p-2.5 font-bold ${isUp ? "text-bullish" : "text-bearish"}`}>
                            {formatINR(h.unrealized_pnl)} ({formatPercent(h.unrealized_pnl_pct)})
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                setSymbol(h.symbol);
                                setSide("SELL");
                                setQuantity(h.quantity);
                              }}
                              className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-bold"
                            >
                              Square Off
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Double-Entry Transaction Ledger */}
          <div className="p-5 rounded-2xl bg-surface-200 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-purple-400" /> Transaction Audit Ledger
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Immutable Double-Entry</span>
            </div>

            {transactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No transactions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-100 text-slate-400 border-b border-border sticky top-0">
                    <tr>
                      <th className="p-2">Type</th>
                      <th className="p-2">Symbol</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Price ₹</th>
                      <th className="p-2">Net Amount</th>
                      <th className="p-2">Cash After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-100/50">
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.type === "BUY"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-rose-950 text-rose-400 border border-rose-800"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="p-2 text-white font-bold">{t.symbol}</td>
                        <td className="p-2 text-slate-300">{t.quantity}</td>
                        <td className="p-2 text-slate-300">₹{t.price?.toFixed(2)}</td>
                        <td className="p-2 text-slate-200 font-semibold">{formatINR(t.net_amount)}</td>
                        <td className="p-2 text-cyan-400">{formatINR(t.cash_after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
