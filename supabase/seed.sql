-- ============================================================================
-- BHARATQUANT AI: SEED DATA & INDIAN MARKET SYMBOLS REFERENCE
-- ============================================================================

-- Reference table for Indian Stock Universe (NIFTY 50 & Key Indices)
CREATE TABLE IF NOT EXISTS public.market_instruments (
    id SERIAL PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    exchange TEXT NOT NULL DEFAULT 'NSE',
    sector TEXT NOT NULL,
    market_cap_category TEXT CHECK (market_cap_category IN ('LARGE_CAP', 'MID_CAP', 'SMALL_CAP', 'INDEX')),
    lot_size INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Seed core instruments
INSERT INTO public.market_instruments (symbol, name, exchange, sector, market_cap_category)
VALUES
    ('NIFTY 50', 'NIFTY 50 Index', 'NSE', 'Indices', 'INDEX'),
    ('SENSEX', 'BSE SENSEX Index', 'BSE', 'Indices', 'INDEX'),
    ('BANKNIFTY', 'NIFTY Bank Index', 'NSE', 'Banking', 'INDEX'),
    ('NIFTYIT', 'NIFTY IT Index', 'NSE', 'Information Technology', 'INDEX'),
    ('RELIANCE', 'Reliance Industries Ltd.', 'NSE', 'Energy & Petrochemicals', 'LARGE_CAP'),
    ('TCS', 'Tata Consultancy Services Ltd.', 'NSE', 'Information Technology', 'LARGE_CAP'),
    ('HDFCBANK', 'HDFC Bank Ltd.', 'NSE', 'Banking & Finance', 'LARGE_CAP'),
    ('INFY', 'Infosys Ltd.', 'NSE', 'Information Technology', 'LARGE_CAP'),
    ('ICICIBANK', 'ICICI Bank Ltd.', 'NSE', 'Banking & Finance', 'LARGE_CAP'),
    ('SBIN', 'State Bank of India', 'NSE', 'Banking & Finance', 'LARGE_CAP'),
    ('BHARTIARTL', 'Bharti Airtel Ltd.', 'NSE', 'Telecommunications', 'LARGE_CAP'),
    ('ITC', 'ITC Ltd.', 'NSE', 'FMCG', 'LARGE_CAP'),
    ('LT', 'Larsen & Toubro Ltd.', 'NSE', 'Infrastructure & Capital Goods', 'LARGE_CAP'),
    ('KOTAKBANK', 'Kotak Mahindra Bank Ltd.', 'NSE', 'Banking & Finance', 'LARGE_CAP'),
    ('HINDUNILVR', 'Hindustan Unilever Ltd.', 'NSE', 'FMCG', 'LARGE_CAP'),
    ('AXISBANK', 'Axis Bank Ltd.', 'NSE', 'Banking & Finance', 'LARGE_CAP'),
    ('TATAMOTORS', 'Tata Motors Ltd.', 'NSE', 'Automobile', 'LARGE_CAP'),
    ('BAJFINANCE', 'Bajaj Finance Ltd.', 'NSE', 'Financial Services', 'LARGE_CAP'),
    ('MARUTI', 'Maruti Suzuki India Ltd.', 'NSE', 'Automobile', 'LARGE_CAP'),
    ('SUNPHARMA', 'Sun Pharmaceutical Industries Ltd.', 'NSE', 'Pharmaceuticals', 'LARGE_CAP')
ON CONFLICT (symbol) DO NOTHING;
