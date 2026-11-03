import math
import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from app.market_data.base import MarketDataProvider, MarketOverview, IndexData, QuoteData, CandleData

# Reference database of top Indian instruments
INDIAN_STOCKS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd.", "exchange": "NSE", "base_price": 2980.50, "sector": "Energy"},
    {"symbol": "TCS", "name": "Tata Consultancy Services Ltd.", "exchange": "NSE", "base_price": 4120.00, "sector": "IT"},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd.", "exchange": "NSE", "base_price": 1745.25, "sector": "Banking"},
    {"symbol": "INFY", "name": "Infosys Ltd.", "exchange": "NSE", "base_price": 1890.80, "sector": "IT"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd.", "exchange": "NSE", "base_price": 1285.40, "sector": "Banking"},
    {"symbol": "SBIN", "name": "State Bank of India", "exchange": "NSE", "base_price": 825.60, "sector": "Banking"},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd.", "exchange": "NSE", "base_price": 1690.15, "sector": "Telecom"},
    {"symbol": "ITC", "name": "ITC Ltd.", "exchange": "NSE", "base_price": 485.30, "sector": "FMCG"},
    {"symbol": "LT", "name": "Larsen & Toubro Ltd.", "exchange": "NSE", "base_price": 3610.00, "sector": "Infrastructure"},
    {"symbol": "TATAMOTORS", "name": "Tata Motors Ltd.", "exchange": "NSE", "base_price": 995.50, "sector": "Auto"},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd.", "exchange": "NSE", "base_price": 7240.00, "sector": "Finance"},
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical Industries Ltd.", "exchange": "NSE", "base_price": 1820.00, "sector": "Pharma"},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd.", "exchange": "NSE", "base_price": 12450.00, "sector": "Auto"}
]

INDIAN_INDICES = [
    {"symbol": "^NSEI", "name": "NIFTY 50", "base_value": 24850.20, "exchange": "NSE"},
    {"symbol": "^BSESN", "name": "SENSEX", "base_value": 81500.40, "exchange": "BSE"},
    {"symbol": "^NSEBANK", "name": "BANK NIFTY", "base_value": 52340.60, "exchange": "NSE"},
    {"symbol": "^CNXIT", "name": "NIFTY IT", "base_value": 42150.10, "exchange": "NSE"},
    {"symbol": "^CNXAUTO", "name": "NIFTY AUTO", "base_value": 25480.90, "exchange": "NSE"},
    {"symbol": "^CNXPHARMA", "name": "NIFTY PHARMA", "base_value": 22910.30, "exchange": "NSE"},
    {"symbol": "^CNXFMCG", "name": "NIFTY FMCG", "base_value": 63420.50, "exchange": "NSE"},
]


class MockMarketDataProvider(MarketDataProvider):
    """
    High-fidelity deterministic simulated market data provider for NSE/BSE.
    Used for safe offline development, unit tests, and continuous validation.
    """

    def __init__(self, seed: int = 42):
        self._seed = seed
        self._rng = random.Random(seed)

    async def get_indices(self) -> List[IndexData]:
        now = datetime.now(timezone.utc)
        results = []
        for idx in INDIAN_INDICES:
            # Deterministic small variation
            var_pct = (math.sin(hash(idx["symbol"]) % 100) * 0.8) + 0.35
            prev_close = idx["base_value"]
            curr_val = round(prev_close * (1 + (var_pct / 100)), 2)
            abs_chg = round(curr_val - prev_close, 2)
            results.append(IndexData(
                name=idx["name"],
                symbol=idx["symbol"],
                value=curr_val,
                change=abs_chg,
                change_percent=round(var_pct, 2),
                previous_close=prev_close,
                data_source="BHARATQUANT_SIMULATED_ENGINE",
                data_status="DEMO",
                timestamp=now
            ))
        return results

    async def get_quote(self, symbol: str, exchange: str = "NSE") -> QuoteData:
        symbol_upper = symbol.upper().replace(".NS", "").replace(".BO", "")
        stock = next((s for s in INDIAN_STOCKS if s["symbol"] == symbol_upper), None)
        
        base_price = stock["base_price"] if stock else 1000.00
        company_name = stock["name"] if stock else f"{symbol_upper} Ltd."
        
        # Consistent variation per symbol
        symbol_seed = sum(ord(c) for c in symbol_upper)
        pct_change = round(((symbol_seed % 500) - 220) / 100.0, 2)
        prev_close = base_price
        last_price = round(prev_close * (1 + (pct_change / 100.0)), 2)
        change = round(last_price - prev_close, 2)
        
        open_price = round(prev_close * (1 + ((pct_change * 0.3) / 100.0)), 2)
        high_price = round(max(last_price, open_price) * 1.012, 2)
        low_price = round(min(last_price, open_price) * 0.988, 2)
        volume = int(500000 + (symbol_seed * 4321) % 4000000)

        return QuoteData(
            symbol=symbol_upper,
            exchange=exchange,
            company_name=company_name,
            last_price=last_price,
            previous_close=prev_close,
            change=change,
            change_percent=pct_change,
            open=open_price,
            high=high_price,
            low=low_price,
            volume=volume,
            data_source="BHARATQUANT_SIMULATED_ENGINE",
            data_status="DEMO",
            timestamp=datetime.now(timezone.utc)
        )

    async def get_overview(self) -> MarketOverview:
        indices = await self.get_indices()
        
        # Generate quotes for all stocks
        all_quotes = []
        for stock in INDIAN_STOCKS:
            q = await self.get_quote(stock["symbol"], stock["exchange"])
            all_quotes.append(q)
            
        sorted_by_change = sorted(all_quotes, key=lambda x: x.change_percent, reverse=True)
        top_gainers = sorted_by_change[:5]
        top_losers = sorted(all_quotes, key=lambda x: x.change_percent)[:5]
        most_active = sorted(all_quotes, key=lambda x: x.volume, reverse=True)[:5]
        
        return MarketOverview(
            indices=indices,
            top_gainers=top_gainers,
            top_losers=top_losers,
            most_active=most_active,
            market_status="OPEN",
            timestamp=datetime.now(timezone.utc)
        )

    async def get_history(
        self,
        symbol: str,
        interval: str = "1d",
        days: int = 180,
        exchange: str = "NSE"
    ) -> List[CandleData]:
        symbol_upper = symbol.upper().replace(".NS", "")
        stock = next((s for s in INDIAN_STOCKS if s["symbol"] == symbol_upper), None)
        base_price = stock["base_price"] if stock else 1000.0
        
        now = datetime.now(timezone.utc)
        candles: List[CandleData] = []
        
        # Start backwards 'days' days ago
        curr_price = base_price * 0.85  # historical starting price
        symbol_hash = sum(ord(c) for c in symbol_upper)
        
        for i in range(days, 0, -1):
            date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            # Deterministic daily drift with small noise
            noise = math.sin((i + symbol_hash) * 0.4) * 0.018 + 0.0006
            day_open = round(curr_price, 2)
            day_close = round(curr_price * (1 + noise), 2)
            day_high = round(max(day_open, day_close) * (1 + abs(math.cos(i) * 0.015)), 2)
            day_low = round(min(day_open, day_close) * (1 - abs(math.sin(i) * 0.014)), 2)
            day_vol = int(400000 + abs(math.sin(i * 0.2)) * 1800000)
            
            candles.append(CandleData(
                time=date,
                open=day_open,
                high=day_high,
                low=day_low,
                close=day_close,
                volume=day_vol
            ))
            curr_price = day_close

        return candles

    async def search_stocks(self, query: str) -> List[Dict[str, Any]]:
        q = query.strip().upper()
        matches = []
        for s in INDIAN_STOCKS:
            if q in s["symbol"] or q in s["name"].upper():
                matches.append({
                    "symbol": s["symbol"],
                    "name": s["name"],
                    "exchange": s["exchange"],
                    "sector": s["sector"],
                    "price": s["base_price"]
                })
        return matches
