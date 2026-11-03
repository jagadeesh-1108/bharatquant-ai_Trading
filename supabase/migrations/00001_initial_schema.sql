-- ============================================================================
-- BHARATQUANT AI: INITIAL DATABASE SCHEMA
-- Migration: 00001_initial_schema.sql
-- Description: Complete schema for Indian Stock Market Intelligence & Paper Trading
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USER PROFILES
-- Extends Supabase auth.users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    experience_level TEXT DEFAULT 'BEGINNER' CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    risk_tolerance TEXT DEFAULT 'MODERATE' CHECK (risk_tolerance IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 2. USER PREFERENCES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    default_exchange TEXT DEFAULT 'NSE' CHECK (default_exchange IN ('NSE', 'BSE')),
    brokerage_model TEXT DEFAULT 'ZERODHA_FLAT_20',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    market_data_mode TEXT DEFAULT 'MOCK' CHECK (market_data_mode IN ('MOCK', 'LIVE_BROKER', 'YFINANCE')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 3. WATCHLISTS & WATCHLIST ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    company_name TEXT,
    added_price NUMERIC(14, 2),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(watchlist_id, symbol, exchange)
);

-- ----------------------------------------------------------------------------
-- 4. STOCK ALERTS & ALERT HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'PRICE_ABOVE', 
        'PRICE_BELOW', 
        'RSI_OVERBOUGHT', 
        'RSI_OVERSOLD', 
        'MA_CROSSOVER_BULLISH', 
        'MA_CROSSOVER_BEARISH', 
        'VOLUME_SPIKE'
    )),
    threshold_value NUMERIC(14, 4) NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES public.stock_alerts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    triggered_price NUMERIC(14, 2) NOT NULL,
    indicator_value NUMERIC(14, 4),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 5. PAPER TRADING ACCOUNTS
-- Default ₹1,00,000 virtual balance
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.paper_trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'INR',
    initial_balance NUMERIC(14, 2) NOT NULL DEFAULT 100000.00,
    current_cash NUMERIC(14, 2) NOT NULL DEFAULT 100000.00,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'RESET')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT positive_cash CHECK (current_cash >= 0)
);

-- ----------------------------------------------------------------------------
-- 6. PAPER PORTFOLIO HOLDINGS
-- Current positions held in paper trading
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    company_name TEXT,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    average_buy_price NUMERIC(14, 2) NOT NULL,
    total_cost NUMERIC(14, 2) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(account_id, symbol, exchange)
);

-- ----------------------------------------------------------------------------
-- 7. PAPER ORDERS
-- Simulated order ledger
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.paper_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT')),
    product_type TEXT NOT NULL DEFAULT 'CNC' CHECK (product_type IN ('CNC', 'MIS')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    requested_price NUMERIC(14, 2),
    executed_price NUMERIC(14, 2),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'REJECTED', 'CANCELLED')),
    rejection_reason TEXT,
    transaction_charges NUMERIC(10, 2) DEFAULT 0.00,
    simulated_tag TEXT DEFAULT 'SIMULATED',
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 8. PAPER TRANSACTIONS (Auditable Double-Entry Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.paper_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.paper_orders(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'RESET', 'DEPOSIT')),
    symbol TEXT,
    quantity INTEGER,
    price NUMERIC(14, 2),
    gross_amount NUMERIC(14, 2) NOT NULL,
    charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(14, 2) NOT NULL,
    cash_balance_after NUMERIC(14, 2) NOT NULL,
    realized_pnl NUMERIC(14, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 9. BACKTEST RUNS
-- Historical strategy backtest records & tearsheets
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.backtest_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    strategy_name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    timeframe TEXT NOT NULL DEFAULT '1d',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital NUMERIC(14, 2) NOT NULL,
    final_capital NUMERIC(14, 2) NOT NULL,
    net_pnl NUMERIC(14, 2) NOT NULL,
    total_return_pct NUMERIC(8, 4) NOT NULL,
    benchmark_return_pct NUMERIC(8, 4),
    total_trades INTEGER NOT NULL,
    winning_trades INTEGER NOT NULL DEFAULT 0,
    losing_trades INTEGER NOT NULL DEFAULT 0,
    win_rate_pct NUMERIC(8, 4) NOT NULL,
    profit_factor NUMERIC(8, 4),
    max_drawdown_pct NUMERIC(8, 4) NOT NULL,
    sharpe_ratio NUMERIC(8, 4),
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    equity_curve JSONB NOT NULL DEFAULT '[]'::jsonb,
    trade_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- 10. AI RESEARCH REPORTS
-- Cached evidence-grounded AI stock research
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_research_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    as_of_date DATE NOT NULL,
    current_price NUMERIC(14, 2) NOT NULL,
    technical_summary JSONB NOT NULL,
    bullish_factors JSONB NOT NULL,
    bearish_factors JSONB NOT NULL,
    risk_factors JSONB NOT NULL,
    overall_sentiment TEXT CHECK (overall_sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL', 'VOLATILE')),
    full_report_markdown TEXT NOT NULL,
    model_used TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_wid ON public.watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.stock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.stock_alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_paper_orders_account ON public.paper_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_paper_orders_user ON public.paper_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account ON public.portfolio_holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.paper_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_backtests_user_id ON public.backtest_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_lookup ON public.ai_research_reports(symbol, as_of_date);
