from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.market_data.mock_provider import MockMarketDataProvider
from app.backtesting.engine import BacktestEngine, BacktestResult
from app.core.security import get_current_user_payload

router = APIRouter()
provider = MockMarketDataProvider()


class BacktestRequest(BaseModel):
    strategy_id: str
    symbol: str
    timeframe: str = "1d"
    days: int = Field(default=365, ge=30, le=1500)
    initial_capital: float = Field(default=100000.0, ge=5000.0)
    brokerage_per_order: float = Field(default=20.0, ge=0.0)
    slippage_pct: float = Field(default=0.05, ge=0.0, le=1.0)
    parameters: Dict[str, Any] = Field(default_factory=dict)


@router.post("/run", response_model=BacktestResult)
async def run_backtest(
    request: BacktestRequest,
    user=Depends(get_current_user_payload)
):
    """
    Executes a historical strategy backtest.
    Calculates net P&L, Sharpe ratio, Max Drawdown, Win Rate, and Indian STT/brokerage costs.
    """
    candles = await provider.get_history(symbol=request.symbol, interval=request.timeframe, days=request.days)
    if not candles or len(candles) < 30:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient historical data for {request.symbol} (minimum 30 bars required)"
        )
        
    engine = BacktestEngine(
        initial_capital=request.initial_capital,
        brokerage_per_order=request.brokerage_per_order,
        slippage_pct=request.slippage_pct
    )
    
    try:
        result = engine.run(
            strategy_name=request.strategy_id,
            symbol=request.symbol.upper(),
            candles=candles,
            params=request.parameters
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest simulation error: {str(e)}")
