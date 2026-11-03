import pytest
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


def test_calculate_sma():
    prices = [10.0, 11.0, 12.0, 13.0, 14.0]
    sma = calculate_sma(prices, period=3)
    assert len(sma) == 5
    assert sma[0] is None
    assert sma[1] is None
    assert sma[2] == pytest.approx(11.0)
    assert sma[3] == pytest.approx(12.0)
    assert sma[4] == pytest.approx(13.0)


def test_calculate_ema():
    prices = [10.0, 11.0, 12.0, 13.0, 14.0]
    ema = calculate_ema(prices, period=3)
    assert len(ema) == 5
    assert ema[0] is None
    assert ema[1] is None
    # Initial EMA is SMA of first 3 = 11.0
    assert ema[2] == pytest.approx(11.0)
    # Next EMA = (13 - 11.0) * (2 / 4) + 11.0 = 2.0 * 0.5 + 11.0 = 12.0
    assert ema[3] == pytest.approx(12.0)


def test_calculate_rsi():
    # Constant prices -> RSI should be handled without zero-division error
    flat_prices = [100.0] * 20
    rsi_flat = calculate_rsi(flat_prices, period=14)
    assert len(rsi_flat) == 20
    assert rsi_flat[-1] == 100.0 or rsi_flat[-1] == 50.0 or rsi_flat[-1] is not None

    # Monotonically increasing prices -> RSI should reach 100
    up_prices = [float(i) for i in range(1, 30)]
    rsi_up = calculate_rsi(up_prices, period=14)
    assert rsi_up[-1] == pytest.approx(100.0)

    # Monotonically decreasing prices -> RSI should reach near 0
    down_prices = [float(50 - i) for i in range(30)]
    rsi_down = calculate_rsi(down_prices, period=14)
    assert rsi_down[-1] == pytest.approx(0.0)


def test_calculate_macd():
    # 40-day sample data
    prices = [100.0 + (i * 0.5) for i in range(45)]
    macd = calculate_macd(prices, fast_period=12, slow_period=26, signal_period=9)
    assert "macd" in macd
    assert "signal" in macd
    assert "histogram" in macd
    assert len(macd["macd"]) == len(prices)
    # The last value of macd should be positive for an upward trend
    assert macd["macd"][-1] is not None
    assert macd["macd"][-1] > 0


def test_calculate_bollinger_bands():
    prices = [100.0, 102.0, 101.0, 103.0, 102.0, 104.0, 103.0, 105.0] * 4  # 32 prices
    bb = calculate_bollinger_bands(prices, period=20, num_std=2.0)
    assert len(bb["upper"]) == len(prices)
    assert len(bb["lower"]) == len(prices)
    assert bb["upper"][-1] > bb["middle"][-1] > bb["lower"][-1]


def test_calculate_atr():
    highs = [105.0, 107.0, 108.0, 106.0, 109.0] * 4
    lows = [95.0, 97.0, 98.0, 96.0, 98.0] * 4
    closes = [100.0, 102.0, 101.0, 103.0, 105.0] * 4
    atr = calculate_atr(highs, lows, closes, period=14)
    assert len(atr) == len(closes)
    assert atr[-1] is not None
    assert atr[-1] > 0


def test_calculate_support_resistance():
    highs = [105.0, 110.0]
    lows = [95.0, 92.0]
    closes = [100.0, 108.0]
    sr = calculate_support_resistance(highs, lows, closes)
    # Pivot = (110 + 92 + 108) / 3 = 310 / 3 = 103.33
    assert sr["pivot"] == pytest.approx(103.33, rel=1e-2)
    assert sr["r1"] > sr["pivot"]
    assert sr["s1"] < sr["pivot"]
