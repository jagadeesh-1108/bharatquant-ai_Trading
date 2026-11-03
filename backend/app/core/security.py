from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

security_bearer = HTTPBearer(auto_error=False)


def get_current_user_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[Dict[str, Any]]:
    """
    Decodes Supabase JWT token and extracts user information.
    In development mode without configured Supabase secret, permits anonymous
    demo user for paper trading and mock testing.
    """
    if not credentials:
        if settings.ENV == "development":
            # Provide mock sandbox user for offline development
            return {
                "sub": "00000000-0000-0000-0000-000000000001",
                "email": "demo.trader@bharatquant.local",
                "role": "authenticated",
                "is_demo": True
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        # If secret is set, verify against secret; otherwise decode without verify for local dev
        if settings.SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        else:
            payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
