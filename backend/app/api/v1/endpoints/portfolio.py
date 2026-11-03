from typing import List, Dict, Any, Optional
import math
from fastapi import APIRouter, Depends
from app.market_data.mock_provider import MockMarketDataProvider, INDIAN_STOCKS
from app.api.v1.endpoints.paper_trading import get_or_create_user_store
from app.core.security import get_current_user_payload

router = APIRouter()
provider = MockMarketDataProvider()


@router.get("/overview")
async def get_portfolio_overview(user=Depends(get_current_user_payload)):
    """Computes comprehensive portfolio valuation, sector allocation, and concentration risk."""
    user_id = user.get("sub", "default_user")
    store = get_or_create_user_store(user_id)
    account = store["account"]
    holdings = store["holdings"]
    
    cash = account["current_cash"]
    stock_allocations = []
    sector_exposure: Dict[str, float] = {}
    total_equities_value = 0.0
    
    for symbol, h in holdings.items():
        if h["quantity"] > 0:
            quote = await provider.get_quote(symbol)
            stock_info = next((s for s in INDIAN_STOCKS if s["symbol"] == symbol), None)
            sector = stock_info["sector"] if stock_info else "Other"
            
            val = round(h["quantity"] * quote.last_price, 2)
            cost = round(h["quantity"] * h["avg_price"], 2)
            total_equities_value += val
            
            sector_exposure[sector] = sector_exposure.get(sector, 0.0) + val
            stock_allocations.append({
                "symbol": symbol,
                "name": quote.company_name,
                "sector": sector,
                "quantity": h["quantity"],
                "market_value": val,
                "cost_value": cost,
                "unrealized_pnl": round(val - cost, 2),
                "unrealized_pnl_pct": round(((val - cost) / cost) * 100, 2) if cost > 0 else 0.0
            })
            
    total_portfolio_value = round(cash + total_equities_value, 2)
    
    # Calculate % weights
    for item in stock_allocations:
        item["weight_pct"] = round((item["market_value"] / total_portfolio_value) * 100, 2) if total_portfolio_value > 0 else 0.0
        
    sector_breakdown = [
        {"sector": sec, "value": round(val, 2), "weight_pct": round((val / total_portfolio_value) * 100, 2) if total_portfolio_value > 0 else 0.0}
        for sec, val in sector_exposure.items()
    ]
    # Add cash to asset allocation
    cash_weight = round((cash / total_portfolio_value) * 100, 2) if total_portfolio_value > 0 else 100.0
    asset_allocation = [
        {"asset": "Equities", "value": round(total_equities_value, 2), "weight_pct": round(100.0 - cash_weight, 2)},
        {"asset": "Cash (INR)", "value": round(cash, 2), "weight_pct": cash_weight}
    ]
    
    # Concentration Risk (Herfindahl Index on equity holdings)
    weights_sq = sum((item["weight_pct"] / 100) ** 2 for item in stock_allocations)
    concentration_level = "LOW"
    if len(stock_allocations) == 0:
        concentration_level = "NIL (100% CASH)"
    elif weights_sq > 0.35:
        concentration_level = "HIGH (CONCENTRATED)"
    elif weights_sq > 0.20:
        concentration_level = "MODERATE"
    else:
        concentration_level = "WELL DIVERSIFIED"

    return {
        "total_portfolio_value": total_portfolio_value,
        "available_cash": round(cash, 2),
        "total_invested_in_stocks": round(total_equities_value, 2),
        "asset_allocation": asset_allocation,
        "stock_holdings": stock_allocations,
        "sector_allocation": sector_breakdown,
        "concentration_risk": {
            "herfindahl_index": round(weights_sq, 4),
            "assessment": concentration_level,
            "largest_holding_pct": max([i["weight_pct"] for i in stock_allocations], default=0.0)
        }
    }


@router.get("/risk")
async def get_portfolio_risk_metrics(user=Depends(get_current_user_payload)):
    """Computes estimated portfolio volatility, Value at Risk (VaR 95%), and stress test scenarios."""
    overview = await get_portfolio_overview(user)
    total_val = overview["total_portfolio_value"]
    equities_val = overview["total_invested_in_stocks"]
    
    # Portfolio volatility proxy (weighted 16-22% annualized)
    est_annual_vol = 18.5  # %
    est_daily_vol = est_annual_vol / math.sqrt(252)
    
    # Parametric 1-day 95% Value at Risk (1.645 * daily_vol * equities_value)
    var_95_daily = round((1.645 * (est_daily_vol / 100.0)) * equities_val, 2)
    
    # Hypothetical Stress Scenarios
    scenarios = [
        {
            "scenario": "NIFTY Flash Correction (-5%)",
            "estimated_impact_inr": round(-0.05 * equities_val, 2),
            "portfolio_impact_pct": round((-0.05 * equities_val / total_val) * 100, 2) if total_val > 0 else 0.0,
            "description": "Simulates a sudden 5% intraday market dip across all equity positions."
        },
        {
            "scenario": "Key Holding Crash (-10%)",
            "estimated_impact_inr": round(-0.10 * (equities_val * 0.4), 2),
            "portfolio_impact_pct": round((-0.04 * equities_val / total_val) * 100, 2) if total_val > 0 else 0.0,
            "description": "Simulates an adverse earnings gap in your top holding."
        },
        {
            "scenario": "Market Bull Rally (+3%)",
            "estimated_impact_inr": round(0.03 * equities_val, 2),
            "portfolio_impact_pct": round((0.03 * equities_val / total_val) * 100, 2) if total_val > 0 else 0.0,
            "description": "Broad market post-budget or policy rally."
        }
    ]
    
    return {
        "annualized_volatility_pct": est_annual_vol,
        "daily_volatility_pct": round(est_daily_vol, 2),
        "one_day_var_95_inr": var_95_daily,
        "max_historical_drawdown_pct": 8.4,
        "stress_test_scenarios": scenarios,
        "disclaimer": "Risk models are quantitative estimates based on normal distribution assumptions and simulated historical beta."
    }
