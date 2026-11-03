from fastapi import APIRouter
from app.api.v1.endpoints import (
    market,
    indicators,
    signals,
    strategies,
    backtests,
    paper_trading,
    portfolio,
    ai,
    watchlists,
    alerts
)

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["Market Data"])
api_router.include_router(indicators.router, prefix="/analytics", tags=["Quantitative Analytics"])
api_router.include_router(signals.router, prefix="/signals", tags=["Trading Signals"])
api_router.include_router(strategies.router, prefix="/strategies", tags=["Trading Strategies"])
api_router.include_router(backtests.router, prefix="/backtests", tags=["Backtesting Engine"])
api_router.include_router(paper_trading.router, prefix="/paper", tags=["Paper Trading"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio & Risk"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Analyst & Assistant"])
api_router.include_router(watchlists.router, prefix="/watchlists", tags=["Watchlists"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
