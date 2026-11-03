# Indian Broker API Integration & Regulatory Compliance

## 1. Indian Broker Comparative Matrix

| Broker | API Availability | Historical Data | WebSocket Support | Cost | Recommended Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Upstox API v2** | REST v2 + OAuth2 | 1-min to daily bars | Protobuf Binary | Free with Demat account | **Primary Indian Broker Adapter** |
| **Zerodha Kite Connect** | REST + Binary WS | Add-on package | Binary stream | ₹2000/mo API + ₹2000/mo Data | Secondary / Production tier |
| **Dhan HQ API** | Modern REST | Intraday & Daily | Fast Binary | Free with Demat account | Alternative Broker Adapter |
| **Angel One SmartAPI** | REST + TOTP Auth | Historical candles | SmartStream WS | Free with Demat account | Additional Broker Option |

## 2. Regulatory Compliance & Safe Trading Rules
1. **SEBI Algorithmic Trading Guidelines:** Live autonomous order execution without human-in-the-loop confirmation is strictly prohibited.
2. **Order Preview & Confirmation:** Any future live order execution must require explicit two-step user confirmation showing exact quantity, limit/market price, and simulated brokerage/STT taxes.
3. **Emergency Trading Killswitch:** The platform maintains an instant disconnect button that disables all external broker API keys.
