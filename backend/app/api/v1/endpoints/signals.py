from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.market_data.mock_provider import MockMarketDataProvider, INDIAN_STOCKS
from app.analytics.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    calculate_atr,
    calculate_historical_volatility,
    calculate_support_resistance
)

router = APIRouter()
provider = MockMarketDataProvider()


class TradingSignal(BaseModel):
    id: str
    symbol: str
    exchange: str = "NSE"
    signal_type: str  # BUY CANDIDATE, SELL CANDIDATE, HOLD / WAIT, NO CLEAR SIGNAL
    confidence_score: int  # 0 to 100
    current_price: float
    target_price: Optional[float]
    stop_loss_invalidation: Optional[float]
    supporting_indicators: Dict[str, Any]
    signal_explanation: str
    risk_factors: List[str]
    data_source: str = "BHARATQUANT_SIMULATED_ENGINE"
    data_status: str = "DEMO"
    timestamp: datetime


def evaluate_deterministic_signal(symbol: str, candles: list) -> TradingSignal:
    """
    Deterministic Quantitative Rule-Based Signal Engine.
    Combines Trend (EMA 9/21, SMA 50), Momentum (RSI 14, MACD), and Volatility (ATR, Bollinger Bands).
    """
    closes = [c.close for c in candles]
    highs = [c.high for c in candles]
    lows = [c.low for c in candles]
    volumes = [c.volume for c in candles]
    
    current_price = closes[-1]
    
    ema_9 = calculate_ema(closes, 9)[-1] or current_price
    ema_21 = calculate_ema(closes, 21)[-1] or current_price
    sma_50 = calculate_sma(closes, 50)[-1] or current_price
    rsi_14 = calculate_rsi(closes, 14)[-1] or 50.0
    macd_res = calculate_macd(closes)
    macd_line = macd_res["macd"][-1] or 0.0
    macd_sig = macd_res["signal"][-1] or 0.0
    macd_hist = macd_res["histogram"][-1] or 0.0
    
    bb = calculate_bollinger_bands(closes, 20, 2.0)
    lower_band = bb["lower"][-1] or (current_price * 0.95)
    upper_band = bb["upper"][-1] or (current_price * 1.05)
    
    atr = calculate_atr(highs, lows, closes, 14)[-1] or (current_price * 0.02)
    volatility = calculate_historical_volatility(closes, 30) or 15.0
    sr = calculate_support_resistance(highs, lows, closes)
    
    # Quantitative scoring logic
    bullish_points = 0
    bearish_points = 0
    reasons = []
    risks = []
    
    # 1. Trend alignment
    if ema_9 > ema_21:
        bullish_points += 20
        reasons.append("EMA 9 is above EMA 21 indicating short-term upward momentum.")
    else:
        bearish_points += 20
        reasons.append("EMA 9 is below EMA 21 signaling short-term downward pressure.")
        
    if current_price > sma_50:
        bullish_points += 15
        reasons.append("Price is trading above the 50-day SMA baseline.")
    else:
        bearish_points += 15
        reasons.append("Price is currently below the 50-day SMA baseline.")
        
    # 2. RSI Momentum
    if rsi_14 < 35:
        bullish_points += 25
        reasons.append(f"RSI is at {rsi_14} indicating an oversold bounce candidate.")
    elif rsi_14 > 68:
        bearish_points += 25
        reasons.append(f"RSI is at {rsi_14} indicating overbought conditions near resistance.")
        risks.append("Momentum is stretched; elevated risk of profit-taking.")
    else:
        reasons.append(f"RSI is neutral at {rsi_14}.")
        
    # 3. MACD Convergence/Divergence
    if macd_hist > 0 and macd_line > macd_sig:
        bullish_points += 20
        reasons.append("MACD histogram is positive with the MACD line above the signal line.")
    elif macd_hist < 0 and macd_line < macd_sig:
        bearish_points += 20
        reasons.append("MACD histogram is negative indicating bearish momentum.")
        
    # 4. Volatility Risk
    if volatility > 25.0:
        risks.append(f"Elevated annualized volatility ({volatility}%); wider stops required.")
    
    # Determine Signal Type & Targets
    if bullish_points >= 60 and bullish_points > bearish_points:
        signal_type = "BUY CANDIDATE"
        confidence_score = min(92, 50 + bullish_points // 2)
        target_price = round(current_price + (2.0 * atr), 2)
        stop_loss = round(current_price - (1.2 * atr), 2)
    elif bearish_points >= 60 and bearish_points > bullish_points:
        signal_type = "SELL CANDIDATE"
        confidence_score = min(90, 50 + bearish_points // 2)
        target_price = round(current_price - (2.0 * atr), 2)
        stop_loss = round(current_price + (1.2 * atr), 2)
    elif abs(bullish_points - bearish_points) < 20:
        signal_type = "HOLD / WAIT"
        confidence_score = 50
        target_price = None
        stop_loss = None
    else:
        signal_type = "NO CLEAR SIGNAL"
        confidence_score = 40
        target_price = None
        stop_loss = None
        
    return TradingSignal(
        id=f"sig_{symbol.lower()}_{int(datetime.now().timestamp())}",
        symbol=symbol.upper(),
        exchange="NSE",
        signal_type=signal_type,
        confidence_score=confidence_score,
        current_price=current_price,
        target_price=target_price,
        stop_loss_invalidation=stop_loss,
        supporting_indicators={
            "rsi_14": rsi_14,
            "ema_9": ema_9,
            "ema_21": ema_21,
            "sma_50": sma_50,
            "macd_histogram": macd_hist,
            "atr_14": atr,
            "volatility_pct": volatility,
            "support_pivot": sr.get("s1", current_price * 0.98),
            "resistance_pivot": sr.get("r1", current_price * 1.02)
        },
        signal_explanation="; ".join(reasons),
        risk_factors=risks if risks else ["Normal market fluctuation risk apply; adhere to position sizing."],
        data_source="BHARATQUANT_SIMULATED_ENGINE",
        data_status="DEMO",
        timestamp=datetime.now(timezone.utc)
    )


@router.get("", response_model=List[TradingSignal])
async def get_all_trading_signals(limit: int = Query(default=10, ge=1, le=50)):
    """Returns calculated trading signals across core Indian stocks."""
    signals = []
    for stock in INDIAN_STOCKS[:limit]:
        candles = await provider.get_history(stock["symbol"], days=90)
        sig = evaluate_deterministic_signal(stock["symbol"], candles)
        signals.append(sig)
    return signals


@router.get("/{symbol}", response_model=TradingSignal)
async def get_symbol_trading_signal(symbol: str):
    """Returns current rule-based trading signal for a specific Indian stock."""
    candles = await provider.get_history(symbol, days=90)
    if not candles:
        raise HTTPException(status_code=404, detail=f"Stock symbol {symbol} not found")
    return evaluate_deterministic_signal(symbol, candles)
