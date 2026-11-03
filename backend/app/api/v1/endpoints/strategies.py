from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class StrategyInfo(BaseModel):
    id: str
    name: str
    description: str
    category: str
    default_parameters: Dict[str, Any]


AVAILABLE_STRATEGIES: List[StrategyInfo] = [
    StrategyInfo(
        id="MA_CROSSOVER",
        name="Moving Average Crossover (Golden/Death Cross)",
        description="Trades momentum when a short-term moving average crosses a long-term moving average.",
        category="Trend Following",
        default_parameters={"fast_period": 20, "slow_period": 50}
    ),
    StrategyInfo(
        id="RSI_MEAN_REVERSION",
        name="RSI Mean Reversion",
        description="Buys oversold bounce (< 30) and sells overbought exhaustion (> 70).",
        category="Mean Reversion",
        default_parameters={"period": 14, "oversold": 30, "overbought": 70}
    ),
    StrategyInfo(
        id="MACD_CROSSOVER",
        name="MACD Signal Line Crossover",
        description="Generates trend acceleration signals when MACD crosses above or below the signal line.",
        category="Momentum",
        default_parameters={"fast_period": 12, "slow_period": 26, "signal_period": 9}
    ),
    StrategyInfo(
        id="BOLLINGER_BAND",
        name="Bollinger Band Volatility Bounce",
        description="Identifies extremes by trading bounces off the 2-standard-deviation bands.",
        category="Volatility",
        default_parameters={"period": 20, "num_std": 2.0}
    )
]


@router.get("", response_model=List[StrategyInfo])
async def list_strategies():
    """Returns list of built-in quantitative trading strategies."""
    return AVAILABLE_STRATEGIES
