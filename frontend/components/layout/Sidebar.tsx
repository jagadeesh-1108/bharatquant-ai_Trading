"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  BrainCircuit,
  Radio,
  FlaskConical,
  Eye,
  Wallet,
  ShieldAlert,
  Bot,
  Settings,
  Sparkles,
  ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/market", label: "Market Explorer", icon: TrendingUp },
  { href: "/analyst", label: "AI Stock Analyst", icon: BrainCircuit, badge: "AI" },
  { href: "/signals", label: "Trading Signals", icon: Radio, badge: "LIVE" },
  { href: "/strategy-lab", label: "Strategy Lab", icon: FlaskConical },
  { href: "/watchlists", label: "Watchlists", icon: Eye },
  { href: "/paper-trading", label: "Paper Trading", icon: Wallet, highlight: true },
  { href: "/portfolio", label: "Portfolio Risk", icon: ShieldAlert },
  { href: "/assistant", label: "AI Copilot", icon: Bot, badge: "Claude" },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-surface-200 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-cyan-500/20">
          BQ
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-white text-base">BharatQuant</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">NSE & BSE Quant Terminal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Intelligence & Analytics
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-surface-100 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      item.badge === "LIVE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-purple-950 text-purple-300 border border-purple-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                    ₹1L
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Virtual Account Balance Widget */}
      <div className="p-3 m-3 rounded-xl bg-surface-100 border border-border">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>Virtual Balance</span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>
        <div className="text-base font-bold text-white tracking-tight">₹1,00,000.00</div>
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Status: SIMULATED</span>
          <Link href="/paper-trading" className="text-cyan-400 hover:underline flex items-center gap-0.5">
            Trade <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
