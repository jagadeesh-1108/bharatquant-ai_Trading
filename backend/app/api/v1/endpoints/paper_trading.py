from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.market_data.mock_provider import MockMarketDataProvider
from app.core.security import get_current_user_payload

router = APIRouter()
provider = MockMarketDataProvider()

# In-memory storage for development / sandbox demo accounts
# Stored per user_id: { account, holdings: {}, orders: [], transactions: [] }
PAPER_STORE: Dict[str, Dict[str, Any]] = {}


def get_or_create_user_store(user_id: str) -> Dict[str, Any]:
    if user_id not in PAPER_STORE:
        PAPER_STORE[user_id] = {
            "account": {
                "user_id": user_id,
                "initial_balance": 100000.00,
                "current_cash": 100000.00,
                "currency": "INR",
                "status": "ACTIVE"
            },
            "holdings": {},  # symbol -> { quantity, avg_price, total_cost }
            "orders": [],
            "transactions": []
        }
    return PAPER_STORE[user_id]


class PaperOrderRequest(BaseModel):
    symbol: str
    exchange: str = "NSE"
    side: str = Field(..., pattern="^(BUY|SELL)$")
    order_type: str = Field(default="MARKET", pattern="^(MARKET|LIMIT)$")
    quantity: int = Field(..., gt=0)
    limit_price: Optional[float] = None


class PaperOrderResponse(BaseModel):
    order_id: str
    symbol: str
    exchange: str
    side: str
    order_type: str
    quantity: int
    requested_price: Optional[float]
    executed_price: float
    status: str
    transaction_charges: float
    total_amount: float
    simulated_tag: str = "SIMULATED"
    timestamp: datetime


@router.get("/account")
async def get_paper_account(user=Depends(get_current_user_payload)):
    """Returns virtual cash balance, invested value, and account overview."""
    user_id = user.get("sub", "default_user")
    store = get_or_create_user_store(user_id)
    account = store["account"]
    holdings = store["holdings"]
    
    total_invested = sum(h["quantity"] * h["avg_price"] for h in holdings.values())
    
    # Calculate current market value and unrealized P&L
    current_portfolio_value = account["current_cash"]
    unrealized_pnl = 0.0
    
    for symbol, h in holdings.items():
        if h["quantity"] > 0:
            quote = await provider.get_quote(symbol)
            mkt_val = h["quantity"] * quote.last_price
            cost_val = h["quantity"] * h["avg_price"]
            current_portfolio_value += mkt_val
            unrealized_pnl += (mkt_val - cost_val)
            
    total_pnl = current_portfolio_value - account["initial_balance"]
    total_pnl_pct = round((total_pnl / account["initial_balance"]) * 100, 2)
    
    return {
        "user_id": user_id,
        "initial_balance": round(account["initial_balance"], 2),
        "available_cash": round(account["current_cash"], 2),
        "invested_amount": round(total_invested, 2),
        "total_portfolio_value": round(current_portfolio_value, 2),
        "unrealized_pnl": round(unrealized_pnl, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": total_pnl_pct,
        "currency": "INR",
        "simulated": True
    }


@router.get("/holdings")
async def get_paper_holdings(user=Depends(get_current_user_payload)):
    """Returns all active stock holdings in the paper trading account."""
    user_id = user.get("sub", "default_user")
    store = get_or_create_user_store(user_id)
    holdings = store["holdings"]
    
    results = []
    for symbol, h in holdings.items():
        if h["quantity"] > 0:
            quote = await provider.get_quote(symbol)
            cur_price = quote.last_price
            cur_val = round(h["quantity"] * cur_price, 2)
            cost_val = round(h["quantity"] * h["avg_price"], 2)
            pnl = round(cur_val - cost_val, 2)
            pnl_pct = round((pnl / cost_val) * 100, 2) if cost_val > 0 else 0.0
            
            results.append({
                "symbol": symbol,
                "exchange": "NSE",
                "company_name": quote.company_name,
                "quantity": h["quantity"],
                "average_buy_price": round(h["avg_price"], 2),
                "current_price": cur_price,
                "invested_value": cost_val,
                "current_value": cur_val,
                "unrealized_pnl": pnl,
                "unrealized_pnl_pct": pnl_pct,
                "simulated": True
            })
    return results


@router.post("/orders", response_model=PaperOrderResponse)
async def place_paper_order(
    order_req: PaperOrderRequest,
    user=Depends(get_current_user_payload)
):
    """
    Submits a simulated paper trading order.
    Validates cash balance before BUY, and existing shares before SELL.
    Applies realistic ₹20 brokerage and STT charges.
    """
    user_id = user.get("sub", "default_user")
    store = get_or_create_user_store(user_id)
    account = store["account"]
    holdings = store["holdings"]
    
    quote = await provider.get_quote(order_req.symbol, order_req.exchange)
    exec_price = quote.last_price
    
    # Check limit price
    if order_req.order_type == "LIMIT" and order_req.limit_price is not None:
        exec_price = order_req.limit_price
        
    gross_val = round(order_req.quantity * exec_price, 2)
    brokerage = 20.00
    stt = round(gross_val * 0.001, 2) if order_req.side == "SELL" else 0.00
    total_charges = brokerage + stt
    order_id = f"sim_ord_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    
    # 1. Handle BUY Order
    if order_req.side == "BUY":
        total_required = gross_val + total_charges
        if account["current_cash"] < total_required:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient virtual cash. Required: ₹{total_required:.2f}, Available: ₹{account['current_cash']:.2f}"
            )
            
        account["current_cash"] = round(account["current_cash"] - total_required, 2)
        
        # Update holding average price
        sym = order_req.symbol.upper()
        if sym in holdings and holdings[sym]["quantity"] > 0:
            existing_qty = holdings[sym]["quantity"]
            existing_cost = holdings[sym]["quantity"] * holdings[sym]["avg_price"]
            new_qty = existing_qty + order_req.quantity
            new_avg = (existing_cost + gross_val) / new_qty
            holdings[sym] = {"quantity": new_qty, "avg_price": new_avg}
        else:
            holdings[sym] = {"quantity": order_req.quantity, "avg_price": exec_price}
            
        # Record Transaction
        store["transactions"].append({
            "id": f"txn_{uuid.uuid4().hex[:8]}",
            "order_id": order_id,
            "type": "BUY",
            "symbol": sym,
            "quantity": order_req.quantity,
            "price": exec_price,
            "charges": total_charges,
            "net_amount": total_required,
            "cash_after": account["current_cash"],
            "timestamp": now.isoformat()
        })

    # 2. Handle SELL Order
    elif order_req.side == "SELL":
        sym = order_req.symbol.upper()
        if sym not in holdings or holdings[sym]["quantity"] < order_req.quantity:
            avail = holdings.get(sym, {}).get("quantity", 0)
            raise HTTPException(
                status_code=400,
                detail=f"Cannot sell {order_req.quantity} shares of {sym}. You only hold {avail} shares."
            )
            
        avg_cost_price = holdings[sym]["avg_price"]
        net_credit = round(gross_val - total_charges, 2)
        account["current_cash"] = round(account["current_cash"] + net_credit, 2)
        realized_pnl = round((exec_price - avg_cost_price) * order_req.quantity - total_charges, 2)
        
        holdings[sym]["quantity"] -= order_req.quantity
        if holdings[sym]["quantity"] == 0:
            del holdings[sym]
            
        # Record Transaction
        store["transactions"].append({
            "id": f"txn_{uuid.uuid4().hex[:8]}",
            "order_id": order_id,
            "type": "SELL",
            "symbol": sym,
            "quantity": order_req.quantity,
            "price": exec_price,
            "charges": total_charges,
            "net_amount": net_credit,
            "realized_pnl": realized_pnl,
            "cash_after": account["current_cash"],
            "timestamp": now.isoformat()
        })

    # Record Order in order history
    order_record = PaperOrderResponse(
        order_id=order_id,
        symbol=order_req.symbol.upper(),
        exchange=order_req.exchange,
        side=order_req.side,
        order_type=order_req.order_type,
        quantity=order_req.quantity,
        requested_price=order_req.limit_price,
        executed_price=exec_price,
        status="EXECUTED",
        transaction_charges=total_charges,
        total_amount=gross_val,
        simulated_tag="SIMULATED",
        timestamp=now
    )
    store["orders"].append(order_record.dict())
    return order_record


@router.get("/orders")
async def get_order_history(user=Depends(get_current_user_payload)):
    """Returns order history for paper trading."""
    user_id = user.get("sub", "default_user")
    store = get_or_create_user_store(user_id)
    return list(reversed(store["orders"]))


@router.get("/transactions")
async def get_transaction_history(user=Depends(get_current_user_payload)):
    """Returns detailed double-entry financial ledger of all paper trades."""
    user_id = user.get("sub", "default_user")
    store = get_or_create_user_store(user_id)
    return list(reversed(store["transactions"]))


@router.post("/reset")
async def reset_paper_account(user=Depends(get_current_user_payload)):
    """Resets paper account back to ₹1,00,000 virtual balance and clears holdings."""
    user_id = user.get("sub", "default_user")
    PAPER_STORE[user_id] = {
        "account": {
            "user_id": user_id,
            "initial_balance": 100000.00,
            "current_cash": 100000.00,
            "currency": "INR",
            "status": "ACTIVE"
        },
        "holdings": {},
        "orders": [],
        "transactions": []
    }
    return {"message": "Paper trading account successfully reset to ₹1,00,000"}
