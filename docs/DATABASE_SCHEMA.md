# BharatQuant AI — Supabase Database Architecture & RLS

## 1. Schema Entities
- `profiles`: User account details, experience level, risk tolerance.
- `user_preferences`: UI theme, default exchange, notification flags.
- `watchlists` & `watchlist_items`: Custom multi-watchlists for Indian stocks.
- `stock_alerts` & `alert_history`: Indicator threshold alerts (RSI, Moving Averages, Price).
- `paper_trading_accounts`: Virtual capital ledger initialized with ₹1,00,000.
- `portfolio_holdings`: Live paper equity positions, average cost basis, total cost.
- `paper_orders`: Simulated orders with `status`, `product_type` (CNC/MIS), charges.
- `paper_transactions`: Immutable double-entry ledger tracking cash balance after every trade.
- `backtest_runs`: Historical tearsheet metrics, parameters, and equity curve logs.
- `ai_research_reports`: Cached evidence-grounded AI research reports.

## 2. Row Level Security Policies
Every user table enforces `auth.uid() = user_id` for SELECT, INSERT, UPDATE, and DELETE.
All financial amounts are stored in `NUMERIC(14,2)` or `NUMERIC(18,4)` to eliminate floating-point rounding errors.
