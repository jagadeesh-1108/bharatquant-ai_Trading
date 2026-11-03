from typing import List, Dict, Any, Optional
import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.market_data.mock_provider import MockMarketDataProvider
from app.core.security import get_current_user_payload

router = APIRouter()
provider = MockMarketDataProvider()

# In-memory store per user: { user_id: [ { id, name, items: [...] } ] }
USER_WATCHLISTS: Dict[str, List[Dict[str, Any]]] = {}


def get_user_watchlists(user_id: str) -> List[Dict[str, Any]]:
    if user_id not in USER_WATCHLISTS:
        USER_WATCHLISTS[user_id] = [
            {
                "id": "wl_default",
                "name": "NIFTY Top 5",
                "is_default": True,
                "items": [
                    {"id": "item_1", "symbol": "RELIANCE", "exchange": "NSE"},
                    {"id": "item_2", "symbol": "TCS", "exchange": "NSE"},
                    {"id": "item_3", "symbol": "HDFCBANK", "exchange": "NSE"},
                    {"id": "item_4", "symbol": "INFY", "exchange": "NSE"},
                    {"id": "item_5", "symbol": "ICICIBANK", "exchange": "NSE"}
                ]
            }
        ]
    return USER_WATCHLISTS[user_id]


class WatchlistCreate(BaseModel):
    name: str


class WatchlistItemAdd(BaseModel):
    symbol: str
    exchange: str = "NSE"


@router.get("")
async def list_watchlists(user=Depends(get_current_user_payload)):
    """Returns all watchlists for current user with live/demo quotes enriched."""
    user_id = user.get("sub", "default_user")
    wls = get_user_watchlists(user_id)
    
    enriched = []
    for wl in wls:
        enriched_items = []
        for item in wl["items"]:
            quote = await provider.get_quote(item["symbol"], item["exchange"])
            enriched_items.append({
                "id": item["id"],
                "symbol": item["symbol"],
                "exchange": item["exchange"],
                "company_name": quote.company_name,
                "last_price": quote.last_price,
                "change": quote.change,
                "change_percent": quote.change_percent,
                "volume": quote.volume
            })
        enriched.append({
            "id": wl["id"],
            "name": wl["name"],
            "is_default": wl.get("is_default", False),
            "items": enriched_items
        })
    return enriched


@router.post("")
async def create_watchlist(req: WatchlistCreate, user=Depends(get_current_user_payload)):
    """Creates a new custom watchlist."""
    user_id = user.get("sub", "default_user")
    wls = get_user_watchlists(user_id)
    new_wl = {
        "id": f"wl_{uuid.uuid4().hex[:8]}",
        "name": req.name,
        "is_default": False,
        "items": []
    }
    wls.append(new_wl)
    return new_wl


@router.post("/{watchlist_id}/items")
async def add_stock_to_watchlist(
    watchlist_id: str,
    req: WatchlistItemAdd,
    user=Depends(get_current_user_payload)
):
    """Adds a stock to a watchlist."""
    user_id = user.get("sub", "default_user")
    wls = get_user_watchlists(user_id)
    target_wl = next((w for w in wls if w["id"] == watchlist_id), None)
    if not target_wl:
        raise HTTPException(status_code=404, detail="Watchlist not found")
        
    sym = req.symbol.upper()
    if any(i["symbol"] == sym for i in target_wl["items"]):
        return {"message": f"{sym} is already in the watchlist"}
        
    new_item = {
        "id": f"item_{uuid.uuid4().hex[:8]}",
        "symbol": sym,
        "exchange": req.exchange
    }
    target_wl["items"].append(new_item)
    return new_item


@router.delete("/{watchlist_id}/items/{item_id}")
async def remove_stock_from_watchlist(
    watchlist_id: str,
    item_id: str,
    user=Depends(get_current_user_payload)
):
    """Removes a stock item from a watchlist."""
    user_id = user.get("sub", "default_user")
    wls = get_user_watchlists(user_id)
    target_wl = next((w for w in wls if w["id"] == watchlist_id), None)
    if not target_wl:
        raise HTTPException(status_code=404, detail="Watchlist not found")
        
    target_wl["items"] = [i for i in target_wl["items"] if i["id"] != item_id]
    return {"message": "Item removed from watchlist"}
