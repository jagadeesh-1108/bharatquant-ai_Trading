from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class StrategySignal(BaseModel):
    bar_index: int
    date: str
    action: str  # BUY, SELL, HOLD
    price: float
    reason: str


class BaseStrategy(ABC):
    """Abstract class for Quantitative Trading Strategies."""
    
    def __init__(self, name: str, params: Dict[str, Any]):
        self.name = name
        self.params = params

    @abstractmethod
    def generate_signals(self, candles: list) -> List[StrategySignal]:
        """
        Receives historical candles and generates trading signals.
        Strictly prevents look-ahead bias: decisions for candle t rely only on candles 0..t.
        """
        pass
