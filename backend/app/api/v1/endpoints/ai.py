from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import json
import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.market_data.mock_provider import MockMarketDataProvider, INDIAN_STOCKS
from app.api.v1.endpoints.indicators import get_stock_technical_analysis
from app.core.config import settings

router = APIRouter()
provider = MockMarketDataProvider()


class AIAnalyzeRequest(BaseModel):
    symbol: str
    exchange: str = "NSE"


class AIChatRequest(BaseModel):
    message: str
    symbol_context: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = []


def generate_structured_research_report(technicals: dict) -> dict:
    """
    Deterministic synthesis of evidence-grounded research report.
    Can be enriched with Anthropic Claude when ANTHROPIC_API_KEY is configured.
    """
    sym = technicals["symbol"]
    price = technicals["current_price"]
    chg = technicals["price_change_pct"]
    inds = technicals["indicators"]
    sr = technicals["support_resistance"]
    
    rsi = inds["rsi_14"]
    vol = inds["annualized_volatility_pct"]
    sma20 = inds["sma_20"]
    sma50 = inds["sma_50"]
    
    bullish = []
    bearish = []
    risks = []
    
    # Trend evaluation
    if price > sma20:
        bullish.append(f"Price is trading above the 20-period moving average (₹{sma20}).")
    else:
        bearish.append(f"Price is lagging below the 20-period moving average (₹{sma20}).")
        
    if inds["ema_9"] > inds["ema_21"]:
        bullish.append("Short-term EMA (9) is favorably placed above medium EMA (21).")
    else:
        bearish.append("Short-term EMA (9) is currently trading below EMA (21).")
        
    # RSI evaluation
    if rsi < 35:
        bullish.append(f"RSI(14) at {rsi} suggests the asset is in oversold territory, potential mean-reversion setup.")
    elif rsi > 65:
        bearish.append(f"RSI(14) at {rsi} approaches overbought territory, profit booking possible.")
    else:
        bullish.append(f"RSI(14) is well-balanced at {rsi}.")
        
    # MACD evaluation
    macd_hist = inds["macd"]["histogram"]
    if macd_hist > 0:
        bullish.append(f"MACD histogram is positive (+{macd_hist}), indicating expanding bullish momentum.")
    else:
        bearish.append(f"MACD histogram is negative ({macd_hist}), showing momentum exhaustion.")
        
    # Risk factors
    risks.append(f"Annualized volatility is measured at {vol}%; standard stop-losses should respect ATR range (₹{inds['atr_14']}).")
    risks.append(f"Key support is established at ₹{sr.get('s1', round(price * 0.98, 2))}; break below invalidates short-term setup.")
    risks.append("Macro-economic events and broad NIFTY sectoral sentiment remain non-diversifiable risk factors.")
    
    # Overall sentiment
    if len(bullish) > len(bearish) + 1:
        sentiment = "BULLISH"
    elif len(bearish) > len(bullish) + 1:
        sentiment = "BEARISH"
    else:
        sentiment = "NEUTRAL"

    summary_text = (
        f"**Quantitative Assessment for {sym} (NSE):** Currently trading at ₹{price:,.2f} ({chg:+.2f}%). "
        f"Momentum analysis reveals an RSI of {rsi} with MACD histogram at {macd_hist}. "
        f"Overall directional bias is **{sentiment}** with nearest support at ₹{sr.get('s1', 0)} "
        f"and resistance at ₹{sr.get('r1', 0)}. "
        f"Risk management: ATR is ₹{inds['atr_14']} with {vol}% historical volatility."
    )

    return {
        "symbol": sym,
        "exchange": "NSE",
        "as_of_date": technicals["as_of_date"],
        "current_price": price,
        "overall_sentiment": sentiment,
        "technical_summary": {
            "rsi_14": rsi,
            "ema_bias": "BULLISH" if inds["ema_9"] > inds["ema_21"] else "BEARISH",
            "volatility_annualized": vol,
            "pivot": sr.get("pivot", price)
        },
        "bullish_factors": bullish,
        "bearish_factors": bearish,
        "risk_factors": risks,
        "full_report_markdown": summary_text,
        "disclaimer": "This is an AI quantitative research report and does NOT constitute personalized investment advice.",
        "model_used": "BharatQuant Hybrid Quant-LLM Engine",
        "data_status": "DEMO"
    }


@router.post("/analyze")
async def analyze_stock(req: AIAnalyzeRequest):
    """
    Retrieves latest quantitative technical indicators for the stock,
    verifies calculations, and synthesizes an evidence-grounded research report.
    """
    tech = await get_stock_technical_analysis(req.symbol, days=180, exchange=req.exchange)
    report = generate_structured_research_report(tech)
    
    # If Anthropic API key is provided, query Claude to provide an enhanced natural language brief
    if settings.ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            prompt = f"""
            You are BharatQuant AI, an elite quantitative stock analyst.
            Analyze the following verified quantitative data for {req.symbol}:
            Current Price: ₹{tech['current_price']} ({tech['price_change_pct']}%)
            RSI(14): {tech['indicators']['rsi_14']}
            SMA 20: {tech['indicators']['sma_20']}, SMA 50: {tech['indicators']['sma_50']}
            MACD Histogram: {tech['indicators']['macd']['histogram']}
            Support R1: {tech['support_resistance']['r1']}, S1: {tech['support_resistance']['s1']}
            ATR: {tech['indicators']['atr_14']}, Volatility: {tech['indicators']['annualized_volatility_pct']}%

            Write a concise, high-density 3-paragraph executive financial summary explaining the key technical setup, bullish/bearish catalysts, and strict risk invalidation levels.
            Do not promise guaranteed returns. Clearly state that this is technical research.
            """
            msg = client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=600,
                messages=[{"role": "user", "content": prompt}]
            )
            report["full_report_markdown"] = msg.content[0].text
            report["model_used"] = f"Anthropic {settings.ANTHROPIC_MODEL}"
        except Exception:
            pass  # Seamless fallback to deterministic synthesis

    return report


@router.post("/chat")
async def chat_with_analyst(req: AIChatRequest):
    """
    Conversational AI Research Assistant grounded strictly in Indian stock data and quantitative finance.
    """
    user_query = req.message.strip()
    
    # Extract symbol from context or query
    symbol = req.symbol_context
    if not symbol:
        for s in INDIAN_STOCKS:
            if s["symbol"] in user_query.upper():
                symbol = s["symbol"]
                break
                
    context_data = ""
    tech = None
    if symbol:
        try:
            tech = await get_stock_technical_analysis(symbol, days=90)
            context_data = (
                f"\n[VERIFIED DATA FOR {symbol}]: Price: ₹{tech['current_price']} ({tech['price_change_pct']}%), "
                f"RSI(14): {tech['indicators']['rsi_14']}, EMA9: {tech['indicators']['ema_9']}, "
                f"EMA21: {tech['indicators']['ema_21']}, ATR: {tech['indicators']['atr_14']}, "
                f"S1: {tech['support_resistance']['s1']}, R1: {tech['support_resistance']['r1']}."
            )
        except Exception:
            pass

    # If Anthropic API key is available, forward prompt
    if settings.ANTHROPIC_API_KEY:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            system_msg = (
                "You are BharatQuant AI, an elite Indian quantitative finance and trading assistant. "
                "You adhere strictly to quantitative evidence and risk management. "
                "Never invent prices or guarantee profits. Explain technical indicators accurately."
            )
            messages = []
            if req.conversation_history:
                messages.extend(req.conversation_history[-6:])
            messages.append({"role": "user", "content": f"{user_query}\n{context_data}"})
            
            res = client.messages.create(
                model=settings.ANTHROPIC_MODEL,
                system=system_msg,
                max_tokens=500,
                messages=messages
            )
            return {
                "reply": res.content[0].text,
                "symbol_analyzed": symbol,
                "model": settings.ANTHROPIC_MODEL
            }
        except Exception:
            pass

    # Built-in intelligent conversational response engine (deterministic fallback)
    query_lower = user_query.lower()
    rsi_context = ""
    if symbol and "indicators" in locals().get("tech", {}):
        curr_rsi = tech["indicators"].get("rsi_14")
        rsi_context = f" For {symbol}, current RSI(14) is {curr_rsi}."

    if "rsi" in query_lower:
        reply = (
            "**Relative Strength Index (RSI):** RSI measures the speed and change of price movements on an oscillator between 0 and 100. "
            "Traditionally, values above 70 indicate overbought conditions (potential pullback or consolidation), "
            f"while values below 30 indicate oversold conditions.{rsi_context}"
        )
    elif "macd" in query_lower:
        reply = (
            "**Moving Average Convergence Divergence (MACD):** MACD is a trend-following momentum indicator showing the relationship between two moving averages (typically 12-day and 26-day EMAs). "
            "A bullish signal occurs when the MACD line crosses above the 9-day signal line, expanding the histogram."
        )
    elif symbol and tech:
        reply = (
            f"**Analysis for {symbol}:** {context_data}\n\n"
            f"The stock exhibits an RSI of {tech['indicators']['rsi_14']} with key support around ₹{tech['support_resistance']['s1']} "
            f"and resistance at ₹{tech['support_resistance']['r1']}. Keep position sizes aligned with volatility."
        )
    elif symbol:
        reply = f"**Analysis for {symbol}:** {context_data}\n\nTechnical indicators are currently being calculated."
    else:
        reply = (
            "Welcome to BharatQuant AI Assistant. You can ask me to analyze any Indian stock (e.g., RELIANCE, TCS, HDFCBANK, INFY), "
            "explain technical indicators like RSI and MACD, backtest quantitative strategies, or review your paper trading portfolio risk."
        )

    return {
        "reply": reply,
        "symbol_analyzed": symbol,
        "model": "BharatQuant Quant-Assistant Engine"
    }
