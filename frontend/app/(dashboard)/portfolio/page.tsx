"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  PieChart as PieIcon,
  Activity,
  AlertTriangle,
  TrendingUp,
  Percent,
  Layers,
  Zap
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import { formatINR, formatPercent } from "@/lib/utils";

const SECTOR_COLORS = ["#00e5ff", "#00c076", "#9d4edd", "#f5a623", "#ff3b53", "#3b82f6", "#ec4899"];

export default function PortfolioRiskPage() {
  const [overview, setOverview] = useState<any>(null);
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        setLoading(true);
        const [ovRes, riskRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/portfolio/overview"),
          fetch("http://127.0.0.1:8000/api/v1/portfolio/risk"),
        ]);
        if (ovRes.ok) setOverview(await ovRes.json());
        if (riskRes.ok) setRisk(await riskRes.json());
      } catch (err) {
        console.error("Failed to load portfolio risk data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolioData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-surface-200 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Portfolio Analytics & AI Risk Manager</h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            PARAMETRIC VAR & CONCENTRATION
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Real-time capital exposure analytics, Herfindahl concentration scoring, and simulated stress scenario stress tests.
        </p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">Total Capital Value</div>
          <div className="text-xl font-black text-white font-mono mt-1">
            {formatINR(overview?.total_portfolio_value || 100000)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">INR Virtual Capital</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">Concentration Risk</div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">
            {overview?.concentration_risk?.assessment || "N/A"}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            HHI Score: {overview?.concentration_risk?.herfindahl_index || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">1-Day VaR (95%)</div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">
            {formatINR(risk?.one_day_var_95_inr || 0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Estimated 1-day max loss</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-200 border border-border">
          <div className="text-[10px] text-slate-400">Portfolio Volatility</div>
          <div className="text-xl font-black text-cyan-400 font-mono mt-1">
            {risk?.annualized_volatility_pct || 18.5}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Annualized Std Dev</div>
        </div>
      </div>

      {/* Visual Analytics Grid: Sector Pie + Stock Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation Breakdown */}
        <div className="p-5 rounded-2xl bg-surface-200 border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-cyan-400" /> Sector Exposure
            </span>
          </div>
          <div className="w-full h-64">
            {overview?.sector_allocation && overview.sector_allocation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.sector_allocation}
                    dataKey="value"
                    nameKey="sector"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {overview.sector_allocation.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0d1322", borderColor: "#1e293b", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
                100% Cash Allocation. No sector equities held.
              </div>
            )}
          </div>
        </div>

        {/* Stock Allocation Weights Bar Chart */}
        <div className="p-5 rounded-2xl bg-surface-200 border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> Holding Allocations (% Weight)
            </span>
          </div>
          <div className="w-full h-64">
            {overview?.stock_holdings && overview.stock_holdings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.stock_holdings}>
                  <XAxis dataKey="symbol" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0d1322", borderColor: "#1e293b", fontSize: "11px" }} />
                  <Bar dataKey="weight_pct" name="Weight (%)" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
                No active stock holdings to chart.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hypothetical Stress-Testing Scenarios */}
      <div className="p-5 rounded-2xl bg-surface-200 border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> Historical Scenario Stress Tests
          </span>
          <span className="text-[10px] text-amber-300 font-mono">HYPOTHETICAL SIMULATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(risk?.stress_test_scenarios || []).map((sc: any, idx: number) => {
            const isLoss = sc.estimated_impact_inr < 0;
            return (
              <div key={idx} className="p-4 rounded-xl bg-surface-100 border border-border">
                <div className="text-xs font-bold text-white mb-1">{sc.scenario}</div>
                <div className="text-[11px] text-slate-400 mb-3">{sc.description}</div>
                <div className="pt-3 border-t border-border flex items-center justify-between font-mono">
                  <span className="text-[10px] text-slate-500">Estimated Impact</span>
                  <span className={`text-xs font-bold ${isLoss ? "text-bearish" : "text-bullish"}`}>
                    {formatINR(sc.estimated_impact_inr)} ({sc.portfolio_impact_pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-border text-[10px] text-slate-500">
          {risk?.disclaimer}
        </div>
      </div>
    </div>
  );
}
