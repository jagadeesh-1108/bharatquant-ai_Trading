# BharatQuant AI — Executive Project Summary & Interview Pitch

---

## ⚡ 1. The 30-Second Elevator Pitch

> **"BharatQuant AI is an institutional-grade stock market intelligence and paper trading web platform built specifically for the Indian markets (NSE & BSE). It combines real-time TradingView-style charts, mathematical technical analysis, an event-driven strategy backtester that accounts for Indian taxes like STT and brokerage, and a 'zero-hallucination' AI stock research analyst powered by Claude. The entire platform is deployed live in production using Next.js on Vercel and Python FastAPI on Render."**

---

## 🎙️ 2. The 2-Minute Detailed Pitch (Problem ➔ Solution ➔ Architecture)

### The Problem
Most retail stock market tools suffer from two major flaws:
1. **AI Hallucinations:** Generic LLMs frequently fabricate stock prices, earnings figures, and make unsubstantiated return predictions.
2. **Backtesting Over-Optimism:** Most amateur backtesters ignore real-world market friction like Indian Securities Transaction Tax (STT), exchange turnover charges, execution slippage, and brokerage fees, producing unrealistic profit numbers.

### The Solution: Mathematics First, AI Second
BharatQuant AI resolves this by enforcing a strict separation of concerns:
- A **high-performance Python backend** calculates real mathematical indicators (Wilder's RSI, EMA ribbons, MACD, Bollinger Bands, ATR, and Floor Pivot points).
- An **evidence-grounded AI model (Claude 3.5 Sonnet)** receives these verified numbers to synthesize natural language equity research briefs with transparent bullish catalysts and risk bounds—never inventing numbers.

---

## 🧭 3. The 7 Core Modules (What the Platform Does)

1. **Market Intelligence & Ticker Tape:** Real-time and simulated tracking of NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT, and sector indices.
2. **60fps Candlestick Charts:** TradingView Lightweight Charts™ rendering canvas Japanese candlestick series with volume histograms.
3. **AI Stock Research Analyst:** Synthesizes evidence-grounded research reports evaluating technical indicators, catalysts, and volatility bounds without hallucinations.
4. **Deterministic Trading Signal Engine:** Rule-based algorithmic signals (`BUY CANDIDATE`, `SELL CANDIDATE`, `HOLD / WAIT`) scored on trend, momentum, and volatility with ATR invalidation stop-loss levels.
5. **Event-Driven Strategy Lab:** Historical backtesting engine simulating quantitative strategies with zero look-ahead bias, modeling Indian STT (0.1%), turnover charges, and flat ₹20 brokerage.
6. **Virtual Paper Trading Environment:** Sandbox with an initial virtual capital of ₹1,00,000 INR, guarded by pre-trade cash validation, anti-shorting delivery checks, and an immutable double-entry audit ledger.
7. **Portfolio Risk Radar:** Calculates concentration risk via the Herfindahl-Hirschman Index (HHI), estimates 1-Day 95% Value at Risk (VaR), and simulates macroeconomic stress tests (e.g. NIFTY -5% corrections).

---

## 🛠️ 4. Full Technology Stack

| Layer | Technologies | Key Responsibility |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15, React 19, TypeScript, Tailwind CSS** | Server & Client hybrid rendering, dark financial terminal UI |
| **Charts** | **TradingView Lightweight Charts™, Recharts** | Canvas 60fps candlestick charts, equity curves, sector pies |
| **Backend API** | **Python 3, FastAPI, Uvicorn, Pydantic v2** | High-speed REST API with automatic OpenAPI Swagger documentation |
| **Quant Analytics** | **NumPy, Pandas, SciPy** | Vectorized indicator math, time-series operations, technical analysis |
| **Database & Security** | **Supabase PostgreSQL 15+, Row-Level Security (RLS)** | Relational integrity, double-entry ledger, user data isolation |
| **AI Orchestration** | **Anthropic Claude 3.5 Sonnet / Multi-LLM Gateway** | Evidence-grounded financial reasoning, conversational copilot |
| **Cloud Hosting & CI/CD** | **Vercel (Frontend) + Render (Backend)** | Edge CDN deployment with automated GitHub CI/CD webhooks |

---

## 🌟 5. The "Smart Twist" (Why This Project Stands Out)

> *"The most interesting technical decision was the **Evidence-Grounded AI Pipeline**. Rather than asking an LLM to predict stock prices directly, our FastAPI quantitative engine calculates all technical indicators deterministically using NumPy. We then feed these exact numbers into the LLM prompt with strict system constraints. This guarantees that the AI acts as an articulate financial translator grounded strictly in mathematical truth, completely eliminating hallucinations."*

---

## 🔗 6. Live Production Links

- **Live Web Application (Vercel):** https://bharatquant-ai-trading.vercel.app
- **Interactive Swagger API Docs (Render):** https://bharatquant-ai-trading-backend.onrender.com/api/v1/docs
- **GitHub Repository:** https://github.com/jagadeesh-1108/bharatquant-ai_Trading
