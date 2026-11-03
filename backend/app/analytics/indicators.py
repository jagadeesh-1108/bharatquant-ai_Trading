import math
from typing import List, Dict, Any, Optional, Tuple


def calculate_sma(prices: List[float], period: int = 20) -> List[Optional[float]]:
    """Calculates Simple Moving Average (SMA)."""
    if len(prices) < period or period <= 0:
        return [None] * len(prices)
    
    sma: List[Optional[float]] = [None] * (period - 1)
    window_sum = sum(prices[:period])
    sma.append(round(window_sum / period, 4))
    
    for i in range(period, len(prices)):
        window_sum += prices[i] - prices[i - period]
        sma.append(round(window_sum / period, 4))
        
    return sma


def calculate_ema(prices: List[float], period: int = 20) -> List[Optional[float]]:
    """Calculates Exponential Moving Average (EMA)."""
    if len(prices) < period or period <= 0:
        return [None] * len(prices)
    
    ema: List[Optional[float]] = [None] * (period - 1)
    multiplier = 2.0 / (period + 1)
    
    # Initial EMA is the SMA of the first 'period' values
    initial_sma = sum(prices[:period]) / period
    ema.append(round(initial_sma, 4))
    
    current_ema = initial_sma
    for price in prices[period:]:
        current_ema = (price - current_ema) * multiplier + current_ema
        ema.append(round(current_ema, 4))
        
    return ema


def calculate_rsi(prices: List[float], period: int = 14) -> List[Optional[float]]:
    """
    Calculates Relative Strength Index (RSI) using Wilder's Smoothing method.
    """
    if len(prices) <= period or period <= 0:
        return [None] * len(prices)
    
    deltas = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    gains = [max(0.0, d) for d in deltas]
    losses = [max(0.0, -d) for d in deltas]
    
    rsi: List[Optional[float]] = [None] * period
    
    # Initial averages
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    
    if avg_loss == 0.0:
        rsi.append(100.0)
    else:
        rs = avg_gain / avg_loss
        rsi.append(round(100.0 - (100.0 / (1.0 + rs)), 2))
        
    for i in range(period, len(deltas)):
        avg_gain = ((avg_gain * (period - 1)) + gains[i]) / period
        avg_loss = ((avg_loss * (period - 1)) + losses[i]) / period
        
        if avg_loss == 0.0:
            rsi.append(100.0)
        else:
            rs = avg_gain / avg_loss
            val = round(100.0 - (100.0 / (1.0 + rs)), 2)
            rsi.append(val)
            
    return rsi


def calculate_macd(
    prices: List[float],
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9
) -> Dict[str, List[Optional[float]]]:
    """Calculates MACD Line, Signal Line, and MACD Histogram."""
    fast_ema = calculate_ema(prices, fast_period)
    slow_ema = calculate_ema(prices, slow_period)
    
    macd_line: List[Optional[float]] = []
    for f, s in zip(fast_ema, slow_ema):
        if f is not None and s is not None:
            macd_line.append(round(f - s, 4))
        else:
            macd_line.append(None)
            
    # Extract valid numbers to compute signal line
    valid_macd_indices = [i for i, v in enumerate(macd_line) if v is not None]
    signal_line: List[Optional[float]] = [None] * len(prices)
    histogram: List[Optional[float]] = [None] * len(prices)
    
    if len(valid_macd_indices) >= signal_period:
        valid_macd_values = [macd_line[i] for i in valid_macd_indices]
        valid_signals = calculate_ema(valid_macd_values, signal_period)
        
        for idx, sig in zip(valid_macd_indices, valid_signals):
            signal_line[idx] = sig
            if sig is not None and macd_line[idx] is not None:
                histogram[idx] = round(macd_line[idx] - sig, 4)
                
    return {
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram
    }


def calculate_bollinger_bands(
    prices: List[float],
    period: int = 20,
    num_std: float = 2.0
) -> Dict[str, List[Optional[float]]]:
    """Calculates Bollinger Bands (Upper, Middle/SMA, Lower, Bandwidth)."""
    sma = calculate_sma(prices, period)
    upper: List[Optional[float]] = [None] * len(prices)
    lower: List[Optional[float]] = [None] * len(prices)
    bandwidth: List[Optional[float]] = [None] * len(prices)
    
    for i in range(period - 1, len(prices)):
        window = prices[i - period + 1 : i + 1]
        mean = sma[i]
        if mean is not None:
            variance = sum((x - mean) ** 2 for x in window) / period
            std_dev = math.sqrt(variance)
            u = round(mean + (num_std * std_dev), 2)
            l = round(mean - (num_std * std_dev), 2)
            upper[i] = u
            lower[i] = l
            bandwidth[i] = round(((u - l) / mean) * 100, 2) if mean > 0 else 0.0
            
    return {
        "upper": upper,
        "middle": sma,
        "lower": lower,
        "bandwidth": bandwidth
    }


def calculate_atr(
    highs: List[float],
    lows: List[float],
    closes: List[float],
    period: int = 14
) -> List[Optional[float]]:
    """Calculates Average True Range (ATR)."""
    if len(closes) <= period or len(highs) != len(lows) or len(lows) != len(closes):
        return [None] * len(closes)
        
    true_ranges: List[float] = [highs[0] - lows[0]]
    for i in range(1, len(closes)):
        tr = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1])
        )
        true_ranges.append(tr)
        
    atr: List[Optional[float]] = [None] * (period - 1)
    # First ATR is simple average
    current_atr = sum(true_ranges[:period]) / period
    atr.append(round(current_atr, 2))
    
    # Wilder's smoothing
    for i in range(period, len(true_ranges)):
        current_atr = ((current_atr * (period - 1)) + true_ranges[i]) / period
        atr.append(round(current_atr, 2))
        
    return atr


def calculate_historical_volatility(prices: List[float], window: int = 30) -> Optional[float]:
    """Calculates Annualized Historical Volatility (assuming 252 trading days)."""
    if len(prices) < window or window < 2:
        return None
    
    recent_prices = prices[-window:]
    log_returns = [math.log(recent_prices[i] / recent_prices[i - 1]) for i in range(1, len(recent_prices))]
    mean_return = sum(log_returns) / len(log_returns)
    variance = sum((r - mean_return) ** 2 for r in log_returns) / (len(log_returns) - 1)
    daily_vol = math.sqrt(variance)
    annualized_vol = daily_vol * math.sqrt(252)
    return round(annualized_vol * 100, 2)


def calculate_support_resistance(
    highs: List[float],
    lows: List[float],
    closes: List[float]
) -> Dict[str, float]:
    """Calculates Standard Pivot Point, Support (S1, S2, S3), and Resistance (R1, R2, R3)."""
    if not highs or not lows or not closes:
        return {}
    
    last_h = highs[-1]
    last_l = lows[-1]
    last_c = closes[-1]
    
    pivot = (last_h + last_l + last_c) / 3.0
    r1 = (2 * pivot) - last_l
    s1 = (2 * pivot) - last_h
    r2 = pivot + (last_h - last_l)
    s2 = pivot - (last_h - last_l)
    r3 = last_h + 2 * (pivot - last_l)
    s3 = last_l - 2 * (last_h - pivot)
    
    return {
        "pivot": round(pivot, 2),
        "r1": round(r1, 2),
        "s1": round(s1, 2),
        "r2": round(r2, 2),
        "s2": round(s2, 2),
        "r3": round(r3, 2),
        "s3": round(s3, 2)
    }
