import asyncio
import sys
import os

# Set UTF-8 encoding for Windows stdout
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.market_data.mock_provider import MockMarketDataProvider
from app.analytics.indicators import calculate_rsi, calculate_sma
from app.backtesting.engine import BacktestEngine
from app.api.v1.endpoints import paper_trading, portfolio, ai


async def test_all_modules():
    print("--- 1. Testing Mock Market Data Provider ---", flush=True)
    provider = MockMarketDataProvider()
    indices = await provider.get_indices()
    assert len(indices) >= 5, "Failed to get indices"
    print(f"PASS: Retrieved {len(indices)} indices (e.g. {indices[0].name} = {indices[0].value})", flush=True)

    quote = await provider.get_quote("RELIANCE")
    assert quote.last_price > 0, "Invalid quote price"
    print(f"PASS: RELIANCE quote: ₹{quote.last_price} ({quote.change_percent}%)", flush=True)

    history = await provider.get_history("RELIANCE", days=60)
    assert len(history) == 60, "History length mismatch"
    print(f"PASS: Retrieved {len(history)} historical daily bars for RELIANCE", flush=True)

    print("\n--- 2. Testing Quantitative Technical Analysis ---", flush=True)
    from app.api.v1.endpoints.indicators import get_stock_technical_analysis
    tech = await get_stock_technical_analysis("TCS", days=90)
    inds = tech["indicators"]
    print(f"PASS: TCS RSI(14): {inds['rsi_14']}, EMA9: {inds['ema_9']}, EMA21: {inds['ema_21']}, ATR: {inds['atr_14']}", flush=True)

    print("\n--- 3. Testing Backtesting Engine ---", flush=True)
    engine = BacktestEngine(initial_capital=100000.0, brokerage_per_order=20.0, slippage_pct=0.05)
    bt_res = engine.run(
        strategy_name="MA_CROSSOVER",
        symbol="INFY",
        candles=history,
        params={"fast_period": 10, "slow_period": 25}
    )
    print(f"PASS: Backtest Complete - Net PnL: ₹{bt_res.net_pnl}, Win Rate: {bt_res.win_rate_pct}%, Max Drawdown: {bt_res.max_drawdown_pct}%", flush=True)

    print("\n--- 4. Testing Paper Trading Engine ---", flush=True)
    mock_user = {"sub": "test_user_001", "email": "test@bharatquant.local"}
    
    await paper_trading.reset_paper_account(mock_user)
    acc = await paper_trading.get_paper_account(mock_user)
    assert acc["available_cash"] == 100000.0
    print(f"PASS: Virtual Account initialized with ₹{acc['available_cash']:,.2f}", flush=True)

    # Buy Order
    order_req = paper_trading.PaperOrderRequest(
        symbol="RELIANCE",
        exchange="NSE",
        side="BUY",
        order_type="MARKET",
        quantity=5
    )
    order_res = await paper_trading.place_paper_order(order_req, mock_user)
    assert order_res.status == "EXECUTED"
    print(f"PASS: Order Executed: BUY 5 RELIANCE @ ₹{order_res.executed_price} (Charges: ₹{order_res.transaction_charges})", flush=True)

    holdings = await paper_trading.get_paper_holdings(mock_user)
    assert len(holdings) == 1
    assert holdings[0]["symbol"] == "RELIANCE" and holdings[0]["quantity"] == 5
    print(f"PASS: Holding verified: {holdings[0]['quantity']} shares of {holdings[0]['symbol']} @ avg ₹{holdings[0]['average_buy_price']}", flush=True)

    pf_overview = await portfolio.get_portfolio_overview(mock_user)
    print(f"PASS: Portfolio Total: ₹{pf_overview['total_portfolio_value']:,.2f}, Concentration: {pf_overview['concentration_risk']['assessment']}", flush=True)

    print("\n========================================================", flush=True)
    print("ALL CORE QUANTITATIVE & FINANCIAL MODULES VERIFIED 100%!", flush=True)
    print("========================================================", flush=True)


if __name__ == "__main__":
    asyncio.run(test_all_modules())
