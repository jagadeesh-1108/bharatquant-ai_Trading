from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from app.market_data.mock_provider import MockMarketDataProvider
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


@router.get("/technicals/{symbol}")
async def get_stock_technical_analysis(
    symbol: str,
    days: int = Query(default=180, ge=30, le=500),
    exchange: str = "NSE"
):
    """
    Computes all standard quantitative indicators for a given stock symbol:
    SMA (20, 50, 200), EMA (9, 21), RSI (14), MACD, Bollinger Bands, ATR, Volatility, S/R.
    """
    candles = await provider.get_history(symbol=symbol, days=days, exchange=exchange)
    if not candles:
        raise HTTPException(status_code=404, detail=f"No price history found for symbol {symbol}")
        
    closes = [c.close for c in candles]
    highs = [c.high for c in candles]
    lows = [c.low for c in candles]
    volumes = [c.volume for c in candles]
    
    current_price = closes[-1]
    prev_close = closes[-2] if len(closes) > 1 else current_price
    price_change_pct = round(((current_price - prev_close) / prev_close) * 100, 2)
    
    sma_20 = calculate_sma(closes, 20)
    sma_50 = calculate_sma(closes, 50)
    sma_200 = calculate_sma(closes, 200) if len(closes) >= 200 else calculate_sma(closes, len(closes))
    ema_9 = calculate_ema(closes, 9)
    ema_21 = calculate_ema(closes, 21)
    rsi_14 = calculate_rsi(closes, 14)
    macd = calculate_macd(closes)
    bb = calculate_bollinger_bands(closes, 20, 2.0)
    atr_14 = calculate_atr(highs, lows, closes, 14)
    volatility_30 = calculate_historical_volatility(closes, 30)
    support_resistance = calculate_support_resistance(highs, lows, closes)
    
    # Volume SMA
    vol_sma_20 = calculate_sma([float(v) for v in volumes], 20)
    current_vol = volumes[-1]
    avg_vol = vol_sma_20[-1] if vol_sma_20 and vol_sma_20[-1] else current_vol
    vol_ratio = round(current_vol / avg_vol, 2) if avg_vol > 0 else 1.0

    return {
        "symbol": symbol.upper(),
        "exchange": exchange,
        "as_of_date": candles[-1].time,
        "current_price": current_price,
        "price_change_pct": price_change_pct,
        "indicators": {
            "sma_20": sma_20[-1],
            "sma_50": sma_50[-1],
            "sma_200": sma_200[-1] if sma_200 else None,
            "ema_9": ema_9[-1],
            "ema_21": ema_21[-1],
            "rsi_14": rsi_14[-1],
            "macd": {
                "line": macd["macd"][-1],
                "signal": macd["signal"][-1],
                "histogram": macd["histogram"][-1]
            },
            "bollinger_bands": {
                "upper": bb["upper"][-1],
                "middle": bb["middle"][-1],
                "lower": bb["lower"][-1],
                "bandwidth_pct": bb["bandwidth"][-1]
            },
            "atr_14": atr_14[-1],
            "annualized_volatility_pct": volatility_30,
            "volume_spike_ratio": vol_ratio
        },
        "support_resistance": support_resistance,
        "data_status": "DEMO"
    }
