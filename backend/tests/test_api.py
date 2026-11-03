import pytest
import httpx
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "BharatQuant" in data["service"]


@pytest.mark.asyncio
async def test_market_overview():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/market/overview")
        assert response.status_code == 200
        data = response.json()
        assert "indices" in data
        assert "top_gainers" in data
        assert len(data["indices"]) >= 5


@pytest.mark.asyncio
async def test_market_indices():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/market/indices")
        assert response.status_code == 200
        data = response.json()
        symbols = [idx["name"] for idx in data]
        assert "NIFTY 50" in symbols
        assert "SENSEX" in symbols


@pytest.mark.asyncio
async def test_stock_quote():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/market/stocks/RELIANCE/quote")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "RELIANCE"
        assert data["last_price"] > 0
        assert data["data_status"] == "DEMO"


@pytest.mark.asyncio
async def test_technical_analysis():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/analytics/technicals/TCS")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "TCS"
        assert "rsi_14" in data["indicators"]
        assert "macd" in data["indicators"]
        assert "bollinger_bands" in data["indicators"]


@pytest.mark.asyncio
async def test_trading_signals():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/signals?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        first = data[0]
        assert "signal_type" in first
        assert first["signal_type"] in ["BUY CANDIDATE", "SELL CANDIDATE", "HOLD / WAIT", "NO CLEAR SIGNAL"]


@pytest.mark.asyncio
async def test_backtest_run():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "strategy_id": "MA_CROSSOVER",
            "symbol": "INFY",
            "days": 90,
            "initial_capital": 100000.0,
            "brokerage_per_order": 20.0,
            "parameters": {"fast_period": 10, "slow_period": 30}
        }
        response = await client.post("/api/v1/backtests/run", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["strategy_name"] == "MA_CROSSOVER"
        assert "win_rate_pct" in data
        assert "equity_curve" in data
        assert len(data["equity_curve"]) > 0


@pytest.mark.asyncio
async def test_paper_trading_flow():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Reset account
        await client.post("/api/v1/paper/reset")

        # 2. Check initial account
        res_acc = await client.get("/api/v1/paper/account")
        assert res_acc.status_code == 200
        acc = res_acc.json()
        assert acc["available_cash"] == 100000.0

        # 3. Buy 10 shares of RELIANCE
        order_payload = {
            "symbol": "RELIANCE",
            "exchange": "NSE",
            "side": "BUY",
            "order_type": "MARKET",
            "quantity": 10
        }
        res_order = await client.post("/api/v1/paper/orders", json=order_payload)
        assert res_order.status_code == 200
        order = res_order.json()
        assert order["status"] == "EXECUTED"
        assert order["simulated_tag"] == "SIMULATED"

        # 4. Check holdings
        res_holdings = await client.get("/api/v1/paper/holdings")
        assert res_holdings.status_code == 200
        holdings = res_holdings.json()
        assert any(h["symbol"] == "RELIANCE" and h["quantity"] == 10 for h in holdings)

        # 5. Attempt to sell more than owned (should fail with 400)
        bad_sell = {
            "symbol": "RELIANCE",
            "exchange": "NSE",
            "side": "SELL",
            "order_type": "MARKET",
            "quantity": 50
        }
        res_bad = await client.post("/api/v1/paper/orders", json=bad_sell)
        assert res_bad.status_code == 400
