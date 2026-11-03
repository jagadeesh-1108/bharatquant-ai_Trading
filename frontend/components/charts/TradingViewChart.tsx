"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";

interface CandleItem {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartProps {
  data: CandleItem[];
  symbol: string;
}

export default function TradingViewChart({ data, symbol }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0d1322" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#1e293b",
      },
      crosshair: {
        vertLine: { color: "#00e5ff", width: 1, style: 3 },
        horzLine: { color: "#00e5ff", width: 1, style: 3 },
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00c076",
      downColor: "#ff3b53",
      borderVisible: false,
      wickUpColor: "#00c076",
      wickDownColor: "#ff3b53",
    });

    // Format and sort candles
    const formattedCandles = [...data]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

    candleSeries.setData(formattedCandles as any);

    // Add Volume Series at bottom
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "", // overlay scale
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const formattedVolume = data.map((c) => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? "rgba(0, 192, 118, 0.4)" : "rgba(255, 59, 83, 0.4)",
    }));

    volumeSeries.setData(formattedVolume as any);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, symbol]);

  return (
    <div className="w-full bg-surface-200 border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white font-mono">{symbol}</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-surface-100 text-cyan-400 border border-cyan-800 font-mono">
            Daily (1D)
          </span>
          <span className="text-[11px] text-slate-400">Lightweight Charts™ Engine</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-bullish inline-block" /> Bullish
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-bearish inline-block" /> Bearish
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}
