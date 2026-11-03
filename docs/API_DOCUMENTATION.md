# BharatQuant AI — REST API Documentation (v1)

Base URL: `/api/v1`

### 1. Market Data
- `GET /market/overview`: Returns key Indian indices (NIFTY 50, SENSEX, BANK NIFTY, IT, AUTO, PHARMA), top gainers, losers, and most active stocks.
- `GET /market/indices`: Current values, percentage changes, and status flags.
- `GET /market/stocks/search?query={symbol}`: Auto-completes stocks across NSE & BSE.
- `GET /market/stocks/{symbol}/quote`: Real-time/simulated quote with OHLC and volume.
- `GET /market/stocks/{symbol}/history?days=180`: Candlestick history for charting.

### 2. Quantitative Analytics & Signals
- `GET /analytics/technicals/{symbol}`: Returns SMA (20, 50, 200), EMA (9, 21), RSI(14), MACD, Bollinger Bands, ATR, Volatility, Pivot S/R.
- `GET /signals?limit=10`: Returns rule-based research signals (BUY CANDIDATE, SELL CANDIDATE, HOLD, NO CLEAR SIGNAL).

### 3. Quantitative Strategy Lab & Backtesting
- `GET /strategies`: Lists available algorithmic trading strategies.
- `POST /backtests/run`: Executes historical simulation, calculating Net P&L, Win Rate, Max Drawdown, Sharpe Ratio, and Equity Curve.

### 4. Paper Trading Virtual Engine
- `GET /paper/account`: Portfolio total value, cash balance, and total P&L.
- `GET /paper/holdings`: Active stock positions and unrealized P&L.
- `POST /paper/orders`: Places simulated BUY or SELL order with balance validation.
- `GET /paper/transactions`: Immutable audit ledger.
- `POST /paper/reset`: Resets account back to ₹1,00,000 virtual balance.

### 5. AI Research Analyst & Copilot
- `POST /ai/analyze`: Generates evidence-grounded research report for an Indian stock.
- `POST /ai/chat`: Context-aware financial AI assistant.
