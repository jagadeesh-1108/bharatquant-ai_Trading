const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorBody.detail || `API request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}

// Market endpoints
export const getMarketOverview = () => fetchApi<any>("/market/overview");
export const getMarketIndices = () => fetchApi<any[]>("/market/indices");
export const searchStocks = (q: string) => fetchApi<any[]>(`/market/stocks/search?query=${encodeURIComponent(q)}`);
export const getStockQuote = (symbol: string) => fetchApi<any>(`/market/stocks/${symbol}/quote`);
export const getStockHistory = (symbol: string, days: number = 180) => fetchApi<any[]>(`/market/stocks/${symbol}/history?days=${days}`);

// Quant Analytics
export const getTechnicalAnalysis = (symbol: string, days: number = 180) => fetchApi<any>(`/analytics/technicals/${symbol}?days=${days}`);
export const getTradingSignals = (limit: number = 10) => fetchApi<any[]>(`/signals?limit=${limit}`);
export const getSymbolSignal = (symbol: string) => fetchApi<any>(`/signals/${symbol}`);

// Backtesting
export const runBacktest = (payload: any) => fetchApi<any>("/backtests/run", {
  method: "POST",
  body: JSON.stringify(payload),
});
export const getStrategies = () => fetchApi<any[]>("/strategies");

// Paper Trading
export const getPaperAccount = () => fetchApi<any>("/paper/account");
export const getPaperHoldings = () => fetchApi<any[]>("/paper/holdings");
export const getPaperOrders = () => fetchApi<any[]>("/paper/orders");
export const placePaperOrder = (order: any) => fetchApi<any>("/paper/orders", {
  method: "POST",
  body: JSON.stringify(order),
});
export const resetPaperAccount = () => fetchApi<any>("/paper/reset", { method: "POST" });

// Portfolio & Risk
export const getPortfolioOverview = () => fetchApi<any>("/portfolio/overview");
export const getPortfolioRisk = () => fetchApi<any>("/portfolio/risk");

// AI Analyst & Assistant
export const analyzeStockAI = (symbol: string) => fetchApi<any>("/ai/analyze", {
  method: "POST",
  body: JSON.stringify({ symbol }),
});
export const chatWithAI = (message: string, symbolContext?: string) => fetchApi<any>("/ai/chat", {
  method: "POST",
  body: JSON.stringify({ message, symbol_context: symbolContext }),
});

// Watchlists & Alerts
export const getWatchlists = () => fetchApi<any[]>("/watchlists");
export const getAlerts = () => fetchApi<any[]>("/alerts");
