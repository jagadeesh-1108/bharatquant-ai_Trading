from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.market_data.mock_provider import MockMarketDataProvider
from app.core.security import get_current_user_payload

router = APIRouter()
provider = MockMarketDataProvider()

# In-memory alerts store per user: { user_id: [ {...} ] }
USER_ALERTS: Dict[str, List[Dict[str, Any]]] = {}


def get_user_alerts(user_id: str) -> List[Dict[str, Any]]:
    if user_id not in USER_ALERTS:
        USER_ALERTS[user_id] = [
            {
                "id": "alt_1",
                "symbol": "RELIANCE",
                "alert_type": "PRICE_ABOVE",
                "threshold_value": 3100.0,
                "notes": "Target breakout level",
                "is_active": True,
                "triggered": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "alt_2",
                "symbol": "TCS",
                "alert_type": "RSI_OVERSOLD",
                "threshold_value": 30.0,
                "notes": "Look for pullback entry",
                "is_active": True,
                "triggered": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
    return USER_ALERTS[user_id]


class AlertCreate(BaseModel):
    symbol: str
    exchange: str = "NSE"
    alert_type: str = Field(..., pattern="^(PRICE_ABOVE|PRICE_BELOW|RSI_OVERBOUGHT|RSI_OVERSOLD|MA_CROSSOVER|VOLUME_SPIKE)$")
    threshold_value: float
    notes: Optional[str] = None


@router.get("")
async def list_alerts(user=Depends(get_current_user_payload)):
    """Returns active and triggered alerts for user."""
    user_id = user.get("sub", "default_user")
    alerts = get_user_alerts(user_id)
    # Enrich with current price
    for a in alerts:
        q = await provider.get_quote(a["symbol"])
        a["current_price"] = q.last_price
    return alerts


@router.post("")
async def create_alert(req: AlertCreate, user=Depends(get_current_user_payload)):
    """Creates a new indicator or price condition alert."""
    user_id = user.get("sub", "default_user")
    alerts = get_user_alerts(user_id)
    new_alert = {
        "id": f"alt_{uuid.uuid4().hex[:8]}",
        "symbol": req.symbol.upper(),
        "exchange": req.exchange,
        "alert_type": req.alert_type,
        "threshold_value": req.threshold_value,
        "notes": req.notes,
        "is_active": True,
        "triggered": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    alerts.append(new_alert)
    return new_alert


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, user=Depends(get_current_user_payload)):
    """Deletes an alert."""
    user_id = user.get("sub", "default_user")
    alerts = get_user_alerts(user_id)
    USER_ALERTS[user_id] = [a for a in alerts if a["id"] != alert_id]
    return {"message": "Alert removed"}
