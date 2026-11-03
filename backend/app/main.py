from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="BharatQuant AI - Production-Quality Indian Stock Market Intelligence, Quantitative Analytics & Paper Trading Platform",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS Configuration - allow local development and any deployed Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint providing platform metadata and navigation links."""
    return {
        "platform": settings.PROJECT_NAME,
        "status": "online",
        "version": settings.VERSION,
        "documentation": f"{settings.API_V1_STR}/docs",
        "health": "/health",
        "message": "Welcome to BharatQuant AI Backend API. Visit /api/v1/docs for interactive Swagger documentation."
    }


@app.get(f"{settings.API_V1_STR}", tags=["Root"])
@app.get(f"{settings.API_V1_STR}/", tags=["Root"])
async def api_v1_root():
    """Redirect or friendly message for API v1 base URL."""
    return {
        "api_version": "v1",
        "status": "active",
        "documentation": f"{settings.API_V1_STR}/docs",
        "endpoints": {
            "market": f"{settings.API_V1_STR}/market",
            "analytics": f"{settings.API_V1_STR}/analytics",
            "signals": f"{settings.API_V1_STR}/signals",
            "strategies": f"{settings.API_V1_STR}/strategies",
            "backtests": f"{settings.API_V1_STR}/backtests",
            "paper_trading": f"{settings.API_V1_STR}/paper",
            "portfolio": f"{settings.API_V1_STR}/portfolio",
            "ai": f"{settings.API_V1_STR}/ai",
            "watchlists": f"{settings.API_V1_STR}/watchlists",
            "alerts": f"{settings.API_V1_STR}/alerts",
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health status and configuration verification."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENV,
        "market_data_mode": settings.MARKET_DATA_MODE,
        "ai_provider": settings.AI_PROVIDER,
        "timestamp_status": "UTC"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
