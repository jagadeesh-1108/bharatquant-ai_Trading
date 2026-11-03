from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from app.market_data.base import MarketOverview, IndexData, QuoteData, CandleData
from app.market_data.mock_provider import MockMarketDataProvider

router = APIRouter()
provider = MockMarketDataProvider()


@router.get("/overview", response_model=MarketOverview)
async def get_market_overview():
    """Returns overview of Indian stock market: key indices, gainers, losers, active stocks."""
    return await provider.get_overview()


@router.get("/indices", response_model=List[IndexData])
async def get_market_indices():
    """Returns real-time or simulated tracking data for NIFTY 50, SENSEX, BANK NIFTY, IT, etc."""
    return await provider.get_indices()


@router.get("/stocks/search")
async def search_stocks(query: str = Query(..., min_length=1, description="Company name or symbol")):
    """Searches Indian stocks across NSE/BSE by symbol or company name."""
    return await provider.search_stocks(query)


@router.get("/stocks/{symbol}/quote", response_model=QuoteData)
async def get_stock_quote(symbol: str, exchange: str = "NSE"):
    """Returns latest quote for a given Indian stock symbol."""
    return await provider.get_quote(symbol, exchange)


@router.get("/stocks/{symbol}/history", response_model=List[CandleData])
async def get_stock_history(
    symbol: str,
    interval: str = Query(default="1d", pattern="^(1m|5m|15m|1h|1d|1wk|1mo)$"),
    days: int = Query(default=180, ge=1, le=1000),
    exchange: str = "NSE"
):
    """Returns historical OHLCV candlestick data for technical analysis and charting."""
    return await provider.get_history(symbol, interval, days, exchange)
