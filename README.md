# BharatQuant AI

**Production-Quality Indian Stock Market Intelligence, Quantitative Analytics & Paper Trading Platform.**

Built for the Indian Stock Market (NSE & BSE) using Next.js 15, TypeScript, Tailwind CSS, Lightweight Charts, FastAPI, NumPy/Pandas, Supabase PostgreSQL, and Claude 3.5 Sonnet.

---

## 🌟 Key Capabilities

1. **Market Intelligence Terminal:** Real-time & simulated tracking for Indian indices (NIFTY 50, SENSEX, BANK NIFTY, IT, AUTO, PHARMA), top gainers, losers, and volume leaders.
2. **AI Stock Research Analyst:** Generates evidence-grounded research summaries with zero hallucinations, evaluating technical indicators and directional catalysts.
3. **Deterministic Trading Signal Generator:** Quantitative multi-factor rules evaluating EMA 9/21 trend alignment, RSI(14) momentum, and MACD divergence.
4. **Quantitative Strategy Lab:** Event-driven historical backtester calculating Win Rate, Max Drawdown, Sharpe Ratio, and realistic Indian STT/brokerage deductions.
5. **Virtual Paper Trading Environment:** Default virtual balance of ₹1,00,000 INR with position balance checks, short-selling prevention, and immutable double-entry ledger.
6. **Portfolio Risk & Analytics:** Herfindahl concentration scoring, 1-day 95% Value at Risk (VaR), and simulated stress scenarios.
7. **AI Copilot:** Conversational quantitative assistant grounded strictly in verified stock data.

---

## 🚀 Quick Start Guide

### 1. Backend (FastAPI + Python)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Swagger API docs available at: `http://127.0.0.1:8000/api/v1/docs`

### 2. Frontend (Next.js 15)
```powershell
cd frontend
npm install
npm run dev
```
Open terminal at: `http://localhost:3000`

### 3. Run Backend Test Suite
```powershell
cd backend
python -m pytest tests/test_indicators.py -v
python tests/verify_api.py
```
