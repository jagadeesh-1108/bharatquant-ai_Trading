# BharatQuant AI — Architecture Specification

## 1. System Overview
BharatQuant AI is an enterprise-grade Indian stock market intelligence, quantitative analytics, and paper trading platform. It unites:
- High-fidelity market data abstraction for NSE and BSE.
- Pure Python mathematical calculations for technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, Volatility).
- Deterministic multi-factor trading signal engine.
- Event-driven historical backtester accounting for Indian STT, GST, and brokerage fees.
- Isolated virtual paper trading environment with double-entry audit ledger.
- Evidence-grounded AI research copilot powered by Claude 3.5 Sonnet without financial hallucination.

## 2. Component Hierarchy
1. **Frontend (Next.js 15 App Router & React 19):**
   - Bloomberg/TradingView high-density financial terminal dark design.
   - Canvas-based Lightweight Charts for 60fps candlestick rendering.
   - Client directly executes session management with Supabase.
2. **Backend Engine (FastAPI + Pydantic v2):**
   - Exposes versioned `/api/v1` REST endpoints.
   - Operates in strict Decimal and NumPy float precision.
   - JWT validation against Supabase auth tokens.
3. **Database (Supabase PostgreSQL 15+):**
   - Row Level Security (RLS) guarantees user isolation.
   - Double-entry ledger prevents balance tampering.

## 3. Financial Safety Guardrails
- **Explicit Labeling:** Every data point and chart displays `LIVE`, `DELAYED`, or `DEMO`.
- **Zero Hallucination:** AI never generates prices, earnings, or guaranteed return claims.
- **Paper Trading Isolation:** Simulated orders are tagged with `SIMULATED` and completely isolated from any future live broker integration.
