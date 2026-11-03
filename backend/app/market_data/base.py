from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class QuoteData(BaseModel):
    symbol: str
    exchange: str = "NSE"
    company_name: str
    last_price: float
    previous_close: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    volume: int
    data_source: str
    data_status: str = Field(description="LIVE, DELAYED, HISTORICAL, or DEMO")
    timestamp: datetime


class CandleData(BaseModel):
    time: str  # ISO string or Unix timestamp string
    open: float
    high: float
    low: float
    close: float
    volume: int


class IndexData(BaseModel):
    name: str
    symbol: str
    value: float
    change: float
    change_percent: float
    previous_close: float
    data_source: str
    data_status: str
    timestamp: datetime


class MarketOverview(BaseModel):
    indices: List[IndexData]
    top_gainers: List[QuoteData]
    top_losers: List[QuoteData]
    most_active: List[QuoteData]
    market_status: str
    timestamp: datetime


class MarketDataProvider(ABC):
    """
    Abstract base class for all market data adapters (Mock, Upstox, Dhan, Yahoo).
    Guarantees consistent data shapes and explicit data status flags.
    """

    @abstractmethod
    async def get_overview(self) -> MarketOverview:
        pass

    @abstractmethod
    async def get_indices(self) -> List[IndexData]:
        pass

    @abstractmethod
    async def get_quote(self, symbol: str, exchange: str = "NSE") -> QuoteData:
        pass

    @abstractmethod
    async def get_history(
        self,
        symbol: str,
        interval: str = "1d",
        days: int = 180,
        exchange: str = "NSE"
    ) -> List[CandleData]:
        pass

    @abstractmethod
    async def search_stocks(self, query: str) -> List[Dict[str, Any]]:
        pass
