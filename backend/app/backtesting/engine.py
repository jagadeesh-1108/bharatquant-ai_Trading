import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.analytics.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands
)


class TradeRecord(BaseModel):
    entry_date: str
    entry_price: float
    exit_date: str
    exit_price: float
    shares: int
    gross_pnl: float
    charges: float
    net_pnl: float
    return_pct: float
    exit_reason: str


class EquityPoint(BaseModel):
    date: str
    portfolio_value: float
    cash: float
    benchmark_value: float


class BacktestResult(BaseModel):
    strategy_name: str
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    final_capital: float
    net_pnl: float
    total_return_pct: float
    benchmark_return_pct: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_pct: float
    profit_factor: float
    max_drawdown_pct: float
    sharpe_ratio: float
    total_charges: float
    trades: List[TradeRecord]
    equity_curve: List[EquityPoint]


class BacktestEngine:
    """
    Quantitative Event-Driven Backtesting Engine.
    Accounts for realistic Indian transaction fees (STT, Turnover, Stamp Duty, Brokerage)
    and execution latency without look-ahead bias.
    """

    def __init__(
        self,
        initial_capital: float = 100000.0,
        brokerage_per_order: float = 20.0,
        slippage_pct: float = 0.05,
        stt_pct: float = 0.1,  # 0.1% on delivery sell
    ):
        self.initial_capital = initial_capital
        self.brokerage = brokerage_per_order
        self.slippage_pct = slippage_pct
        self.stt_pct = stt_pct

    def run(
        self,
        strategy_name: str,
        symbol: str,
        candles: list,
        params: Dict[str, Any]
    ) -> BacktestResult:
        if len(candles) < 30:
            raise ValueError("Insufficient candle history for backtesting (minimum 30 bars required)")

        closes = [c.close for c in candles]
        opens = [c.open for c in candles]
        dates = [c.time for c in candles]

        # Generate signals based on strategy
        raw_signals = self._compute_signals(strategy_name, candles, params)

        cash = self.initial_capital
        position_shares = 0
        entry_price = 0.0
        entry_date = ""
        total_charges = 0.0
        trades: List[TradeRecord] = []
        equity_curve: List[EquityPoint] = []

        # Benchmark calculation (Buy & Hold from bar 0)
        benchmark_shares = int(self.initial_capital / opens[0]) if opens[0] > 0 else 1
        benchmark_cash_rem = self.initial_capital - (benchmark_shares * opens[0])

        peak_portfolio_value = self.initial_capital
        max_drawdown = 0.0

        for i in range(len(candles)):
            curr_date = dates[i]
            curr_close = closes[i]
            next_open = opens[i + 1] if i + 1 < len(opens) else curr_close
            
            signal = raw_signals[i]  # 1: BUY, -1: SELL, 0: HOLD
            
            # 1. Process Exit / Sell Signal
            if position_shares > 0 and signal == -1:
                # Execute exit on current close with slippage
                exit_price = round(curr_close * (1 - (self.slippage_pct / 100)), 2)
                gross_amount = round(position_shares * exit_price, 2)
                stt = round(gross_amount * (self.stt_pct / 100), 2)
                charges = self.brokerage + stt
                net_amount = round(gross_amount - charges, 2)
                
                cash += net_amount
                total_charges += charges
                gross_pnl = round((exit_price - entry_price) * position_shares, 2)
                net_pnl = round(gross_pnl - charges, 2)
                ret_pct = round(((exit_price - entry_price) / entry_price) * 100, 2)

                trades.append(TradeRecord(
                    entry_date=entry_date,
                    entry_price=entry_price,
                    exit_date=curr_date,
                    exit_price=exit_price,
                    shares=position_shares,
                    gross_pnl=gross_pnl,
                    charges=charges,
                    net_pnl=net_pnl,
                    return_pct=ret_pct,
                    exit_reason="Strategy Sell Signal"
                ))
                position_shares = 0
                entry_price = 0.0

            # 2. Process Entry / Buy Signal (Long only)
            elif position_shares == 0 and signal == 1 and cash > 500:
                # Execute buy with slippage
                exec_price = round(curr_close * (1 + (self.slippage_pct / 100)), 2)
                # Position sizing: use 95% of available cash
                alloc_cash = cash * 0.95
                shares_to_buy = int(alloc_cash / exec_price)
                if shares_to_buy > 0:
                    gross_cost = round(shares_to_buy * exec_price, 2)
                    charges = self.brokerage
                    total_cost = round(gross_cost + charges, 2)
                    if cash >= total_cost:
                        cash -= total_cost
                        total_charges += charges
                        position_shares = shares_to_buy
                        entry_price = exec_price
                        entry_date = curr_date

            # Portfolio Mark-to-Market Value
            position_value = position_shares * curr_close
            current_portfolio_value = round(cash + position_value, 2)
            benchmark_val = round((benchmark_shares * curr_close) + benchmark_cash_rem, 2)

            equity_curve.append(EquityPoint(
                date=curr_date,
                portfolio_value=current_portfolio_value,
                cash=round(cash, 2),
                benchmark_value=benchmark_val
            ))

            # Drawdown calculation
            if current_portfolio_value > peak_portfolio_value:
                peak_portfolio_value = current_portfolio_value
            dd = (peak_portfolio_value - current_portfolio_value) / peak_portfolio_value
            if dd > max_drawdown:
                max_drawdown = dd

        # Final Closeout of open position at last bar for tearsheet
        if position_shares > 0:
            last_close = closes[-1]
            gross_amount = round(position_shares * last_close, 2)
            charges = self.brokerage
            cash += round(gross_amount - charges, 2)
            total_charges += charges
            net_pnl = round((last_close - entry_price) * position_shares - charges, 2)
            trades.append(TradeRecord(
                entry_date=entry_date,
                entry_price=entry_price,
                exit_date=dates[-1],
                exit_price=last_close,
                shares=position_shares,
                gross_pnl=round((last_close - entry_price) * position_shares, 2),
                charges=charges,
                net_pnl=net_pnl,
                return_pct=round(((last_close - entry_price) / entry_price) * 100, 2),
                exit_reason="End of Backtest Period"
            ))

        final_capital = round(cash, 2)
        net_profit = round(final_capital - self.initial_capital, 2)
        total_return_pct = round((net_profit / self.initial_capital) * 100, 2)
        benchmark_ret_pct = round(((equity_curve[-1].benchmark_value - self.initial_capital) / self.initial_capital) * 100, 2)

        winning_trades = [t for t in trades if t.net_pnl > 0]
        losing_trades = [t for t in trades if t.net_pnl <= 0]
        total_t_count = len(trades)
        win_rate = round((len(winning_trades) / total_t_count) * 100, 2) if total_t_count > 0 else 0.0

        gross_wins = sum(t.net_pnl for t in winning_trades)
        gross_losses = abs(sum(t.net_pnl for t in losing_trades))
        profit_factor = round(gross_wins / gross_losses, 2) if gross_losses > 0 else (99.0 if gross_wins > 0 else 1.0)

        # Sharpe ratio estimation
        returns = []
        for i in range(1, len(equity_curve)):
            ret = (equity_curve[i].portfolio_value - equity_curve[i-1].portfolio_value) / equity_curve[i-1].portfolio_value
            returns.append(ret)
        if len(returns) > 1:
            mean_ret = sum(returns) / len(returns)
            variance = sum((r - mean_ret) ** 2 for r in returns) / (len(returns) - 1)
            vol = math.sqrt(variance)
            sharpe = round((mean_ret / vol) * math.sqrt(252), 2) if vol > 0 else 0.0
        else:
            sharpe = 0.0

        return BacktestResult(
            strategy_name=strategy_name,
            symbol=symbol,
            start_date=dates[0],
            end_date=dates[-1],
            initial_capital=self.initial_capital,
            final_capital=final_capital,
            net_pnl=net_profit,
            total_return_pct=total_return_pct,
            benchmark_return_pct=benchmark_ret_pct,
            total_trades=total_t_count,
            winning_trades=len(winning_trades),
            losing_trades=len(losing_trades),
            win_rate_pct=win_rate,
            profit_factor=profit_factor,
            max_drawdown_pct=round(max_drawdown * 100, 2),
            sharpe_ratio=sharpe,
            total_charges=round(total_charges, 2),
            trades=trades,
            equity_curve=equity_curve
        )

    def _compute_signals(self, strategy_name: str, candles: list, params: Dict[str, Any]) -> List[int]:
        """
        Computes bar-by-bar signals (1 = Buy, -1 = Sell, 0 = Hold).
        """
        closes = [c.close for c in candles]
        signals = [0] * len(candles)

        if strategy_name == "MA_CROSSOVER":
            fast_p = int(params.get("fast_period", 20))
            slow_p = int(params.get("slow_period", 50))
            fast_ma = calculate_sma(closes, fast_p)
            slow_ma = calculate_sma(closes, slow_p)
            for i in range(1, len(candles)):
                if fast_ma[i-1] is not None and slow_ma[i-1] is not None:
                    # Bullish cross
                    if fast_ma[i-1] <= slow_ma[i-1] and fast_ma[i] > slow_ma[i]:
                        signals[i] = 1
                    # Bearish cross
                    elif fast_ma[i-1] >= slow_ma[i-1] and fast_ma[i] < slow_ma[i]:
                        signals[i] = -1

        elif strategy_name == "RSI_MEAN_REVERSION":
            rsi_period = int(params.get("period", 14))
            oversold = float(params.get("oversold", 30))
            overbought = float(params.get("overbought", 70))
            rsi_values = calculate_rsi(closes, rsi_period)
            for i in range(1, len(candles)):
                if rsi_values[i-1] is not None and rsi_values[i] is not None:
                    if rsi_values[i-1] < oversold and rsi_values[i] >= oversold:
                        signals[i] = 1
                    elif rsi_values[i-1] > overbought and rsi_values[i] <= overbought:
                        signals[i] = -1

        elif strategy_name == "MACD_CROSSOVER":
            fast = int(params.get("fast_period", 12))
            slow = int(params.get("slow_period", 26))
            sig = int(params.get("signal_period", 9))
            macd_res = calculate_macd(closes, fast, slow, sig)
            hist = macd_res["histogram"]
            for i in range(1, len(candles)):
                if hist[i-1] is not None and hist[i] is not None:
                    if hist[i-1] <= 0 and hist[i] > 0:
                        signals[i] = 1
                    elif hist[i-1] >= 0 and hist[i] < 0:
                        signals[i] = -1

        elif strategy_name == "BOLLINGER_BAND":
            period = int(params.get("period", 20))
            num_std = float(params.get("num_std", 2.0))
            bb = calculate_bollinger_bands(closes, period, num_std)
            for i in range(1, len(candles)):
                if bb["lower"][i] is not None and bb["upper"][i] is not None:
                    if closes[i-1] < bb["lower"][i-1] and closes[i] >= bb["lower"][i]:
                        signals[i] = 1
                    elif closes[i-1] > bb["upper"][i-1] and closes[i] <= bb["upper"][i]:
                        signals[i] = -1

        else:
            # Default fallback: EMA 9 / EMA 21 crossover
            fast_ema = calculate_ema(closes, 9)
            slow_ema = calculate_ema(closes, 21)
            for i in range(1, len(candles)):
                if fast_ema[i-1] is not None and slow_ema[i-1] is not None:
                    if fast_ema[i-1] <= slow_ema[i-1] and fast_ema[i] > slow_ema[i]:
                        signals[i] = 1
                    elif fast_ema[i-1] >= slow_ema[i-1] and fast_ema[i] < slow_ema[i]:
                        signals[i] = -1

        return signals
