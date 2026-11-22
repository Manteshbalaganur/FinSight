"use client";

import { useState } from "react";
import ModelComparisonChart from "@/components/charts/ModelComparisonChart";
import PredictionChart from "@/components/charts/PredictionChart";
import { Loading, ErrorBox, Notice } from "@/components/DataState";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { holdings } from "@/lib/holdings";
import { useAsync } from "@/lib/hooks";
import { cn, formatMoney } from "@/lib/utils";

const HORIZONS = [
  { days: 1, label: "Next trading day" },
  { days: 5, label: "Next 5 trading days" },
  { days: 7, label: "Next 7 trading days" },
];

const DIRECTION_STYLE = {
  UP: { text: "text-profit", bg: "bg-profit/20", border: "border-profit/50", glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]", Icon: TrendingUp },
  DOWN: { text: "text-loss", bg: "bg-loss/20", border: "border-loss/50", glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]", Icon: TrendingDown },
  NEUTRAL: { text: "text-neutral", bg: "bg-neutral/20", border: "border-neutral/50", glow: "", Icon: Minus },
} as const;

export default function PredictionPage() {
  const supported = useAsync(() => api.supported(), []);
  const [symbol, setSymbol] = useState(holdings[0].ticker);
  const [horizon, setHorizon] = useState(1);
  const pred = useAsync(() => api.predict(symbol, horizon), [symbol, horizon]);

  const p = pred.data;
  const style = p ? DIRECTION_STYLE[p.direction] : DIRECTION_STYLE.NEUTRAL;
  const currencySymbol = p?.currency === "INR" ? "\u20B9" : "$";
  const selectClass =
    "rounded-lg border border-border bg-bg-card px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-colors duration-200";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">ML Model Predictions</h1>
        <p className="mt-1 text-sm text-text-muted">
          Experimental price estimates from a Random Forest on technical indicators, adjusted by news sentiment
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className={selectClass}>
          {(supported.data ?? holdings.map((h) => ({ symbol: h.ticker, name: h.name, market: "India" }))).map((s) => (
            <option key={s.symbol} value={s.symbol} className="bg-bg-card">
              {s.name} ({s.symbol})
            </option>
          ))}
        </select>
        <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className={selectClass}>
          {HORIZONS.map((h) => (
            <option key={h.days} value={h.days} className="bg-bg-card">
              {h.label}
            </option>
          ))}
        </select>
      </div>

      {pred.loading ? (
        <Loading label="Training model on historical prices and fetching news sentiment (first run can take ~10-20s)..." />
      ) : pred.error ? (
        <ErrorBox message={`Prediction unavailable: ${pred.error}`} onRetry={pred.reload} />
      ) : p ? (
        <>
          <div className={cn("rounded-xl border-2 bg-bg-card p-6", style.border, style.glow)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-muted">Prediction for</p>
                <p className="text-2xl font-bold text-text-primary">{p.symbol}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", style.bg)}>
                  <style.Icon className={style.text} size={24} />
                </div>
                <div>
                  <p className="text-sm text-text-muted">{p.horizon_label}</p>
                  <p className={cn("text-xl font-bold", style.text)}>{p.direction}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-text-muted">Estimated price</p>
                <p className={cn("text-2xl font-bold tabular-nums", style.text)}>{formatMoney(p.predicted_price, p.currency)}</p>
                <p className="text-xs text-text-muted tabular-nums">
                  {p.expected_change_pct >= 0 ? "+" : ""}
                  {p.expected_change_pct}% vs {formatMoney(p.current_price, p.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Backtest accuracy</p>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{p.backtest_directional_accuracy}%</p>
                <p className="text-xs text-text-muted">direction, held-out data</p>
              </div>
              <div className="max-w-xs">
                <p className="text-sm text-text-muted">Based on</p>
                <p className="text-sm text-text-primary">{p.sentiment.note}</p>
              </div>
            </div>
          </div>

          {!p.sentiment.used && <Notice>{p.sentiment.note}</Notice>}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["RSI (14)", `${p.technical_indicators.rsi_14} · ${p.technical_indicators.rsi_signal}`],
              ["20-day average", `${currencySymbol}${p.technical_indicators.sma_20}`],
              ["50-day average", p.technical_indicators.sma_50 ? `${currencySymbol}${p.technical_indicators.sma_50}` : "n/a"],
              ["Trend", p.technical_indicators.trend],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-bg-card p-4">
                <p className="text-xs text-text-muted">{k}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{v}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">Model Comparison — Directional Accuracy (held-out test)</h3>
              <ModelComparisonChart models={p.model_comparison} />
              <div className="mt-4 space-y-2">
                {p.model_comparison.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <span className={cn("font-medium", m.best ? "text-profit" : "text-text-muted")}>
                      {m.name} {m.best && "★ Best"}
                    </span>
                    <span className="tabular-nums text-text-muted">
                      Accuracy {m.accuracy}% · RMSE {m.rmse}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">Predicted vs Actual — Last 30 Test Days</h3>
              <PredictionChart data={p.backtest} currencySymbol={currencySymbol} />
            </div>
          </div>
        </>
      ) : null}

      <div className="flex items-start gap-3 rounded-xl border border-neutral/30 bg-neutral/10 p-4">
        <AlertTriangle className="mt-0.5 shrink-0 text-neutral" size={18} />
        <p className="text-sm text-text-muted">
          {p?.disclaimer ?? "Experimental estimates for academic demonstration. Not financial advice."} Accuracy near 50% means
          the model has little predictive edge, which is typical for daily stock prices.
        </p>
      </div>
    </div>
  );
}
