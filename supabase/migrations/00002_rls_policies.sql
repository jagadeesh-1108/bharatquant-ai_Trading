-- ============================================================================
-- BHARATQUANT AI: ROW LEVEL SECURITY & TRIGGERS
-- Migration: 00002_rls_policies.sql
-- Description: Strict Row Level Security policies and profile initialization
-- ============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_research_reports ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. USER PREFERENCES POLICIES
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert or update own preferences"
    ON public.user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- 4. WATCHLISTS & ITEMS POLICIES
CREATE POLICY "Users can view own watchlists"
    ON public.watchlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlists"
    ON public.watchlists FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own watchlist items"
    ON public.watchlist_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.watchlists
        WHERE watchlists.id = watchlist_items.watchlist_id
        AND watchlists.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own watchlist items"
    ON public.watchlist_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.watchlists
        WHERE watchlists.id = watchlist_items.watchlist_id
        AND watchlists.user_id = auth.uid()
    ));

-- 5. STOCK ALERTS & HISTORY POLICIES
CREATE POLICY "Users can view and manage own stock alerts"
    ON public.stock_alerts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own alert history"
    ON public.alert_history FOR SELECT
    USING (auth.uid() = user_id);

-- 6. PAPER TRADING ACCOUNT POLICIES
CREATE POLICY "Users can view own paper trading account"
    ON public.paper_trading_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own portfolio holdings"
    ON public.portfolio_holdings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own paper orders"
    ON public.paper_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paper orders"
    ON public.paper_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own paper transactions"
    ON public.paper_transactions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.paper_trading_accounts
        WHERE paper_trading_accounts.id = paper_transactions.account_id
        AND paper_trading_accounts.user_id = auth.uid()
    ));

-- 7. BACKTEST RUNS POLICIES
CREATE POLICY "Users can view own backtests"
    ON public.backtest_runs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backtests"
    ON public.backtest_runs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backtests"
    ON public.backtest_runs FOR DELETE
    USING (auth.uid() = user_id);

-- 8. AI RESEARCH REPORTS POLICIES (Public read for all authenticated users, cached analysis)
CREATE POLICY "Authenticated users can view AI reports"
    ON public.ai_research_reports FOR SELECT
    TO authenticated
    USING (TRUE);

-- ----------------------------------------------------------------------------
-- TRIGGER: AUTO-CREATE PROFILE & INITIALIZE ₹1,00,000 VIRTUAL ACCOUNT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_watchlist_id UUID;
BEGIN
    -- 1. Create Profile
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Trader'), NEW.email);

    -- 2. Create User Preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    -- 3. Create Paper Trading Account with default ₹1,00,000 INR
    INSERT INTO public.paper_trading_accounts (user_id, initial_balance, current_cash)
    VALUES (NEW.id, 100000.00, 100000.00);

    -- 4. Create Default Watchlist
    INSERT INTO public.watchlists (user_id, name, is_default)
    VALUES (NEW.id, 'NIFTY Bluechips', TRUE)
    RETURNING id INTO default_watchlist_id;

    -- 5. Seed default watchlist with core Indian symbols
    INSERT INTO public.watchlist_items (watchlist_id, symbol, exchange, company_name, display_order)
    VALUES 
        (default_watchlist_id, 'RELIANCE', 'NSE', 'Reliance Industries Ltd.', 1),
        (default_watchlist_id, 'TCS', 'NSE', 'Tata Consultancy Services Ltd.', 2),
        (default_watchlist_id, 'HDFCBANK', 'NSE', 'HDFC Bank Ltd.', 3),
        (default_watchlist_id, 'INFY', 'NSE', 'Infosys Ltd.', 4),
        (default_watchlist_id, 'ICICIBANK', 'NSE', 'ICICI Bank Ltd.', 5);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
