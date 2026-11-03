"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  BrainCircuit,
  CornerDownLeft
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  symbol?: string;
}

const QUICK_PROMPTS = [
  "Analyze Reliance stock current technical setup",
  "What does RSI(14) indicate for TCS?",
  "Explain the MACD indicator and signal line crossovers",
  "What are the key technical risks in HDFC Bank?",
  "How should I manage my paper trading portfolio risk?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am **BharatQuant AI Copilot**, your quantitative stock market research assistant. I can analyze Indian stocks (e.g. RELIANCE, TCS, INFY, HDFCBANK), explain technical indicators (RSI, MACD, Bollinger Bands), or evaluate your paper trading risk. What would you like to explore today?",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, symbol: data.symbol_analyzed },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an issue connecting to the quantitative backend. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to reach BharatQuant AI service. Ensure the FastAPI backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-surface-200 border border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">BharatQuant AI Copilot</h1>
              <span className="text-[10px] px-2 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                CLAUDE / MULTI-LLM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Strictly grounded in verified market data and quantitative models.</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-surface-200 border border-border space-y-4">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? "bg-cyan-600 text-black" : "bg-purple-950 text-purple-300 border border-purple-800"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? "bg-cyan-500/10 text-cyan-100 border border-cyan-500/30"
                    : "bg-surface-100 text-slate-200 border border-border"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                {msg.symbol && (
                  <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5 text-[10px] text-purple-400 font-mono">
                    <Sparkles className="w-3 h-3" />
                    <span>Analyzed Symbol: {msg.symbol}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-100 border border-border flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing market data & computing technicals...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-100 border border-border text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-surface-200 border border-border"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about Indian stocks, RSI, MACD, or risk management..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
