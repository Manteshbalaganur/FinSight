"""Experimental price prediction: Random Forest on technical features + a news-sentiment adjustment.

See README ("How the prediction works") for the full explanation.
"""
import logging
import math

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from app.core.cache import cached
from app.core.errors import AppError, InsufficientDataError, InvalidRequestError
from app.core.stocks import normalize_symbol
from app.services import sentiment_service, stock_service

log = logging.getLogger("finsight.prediction")

ALLOWED_HORIZONS = (1, 5, 7)
MIN_ROWS = 200           # usable rows after indicator warm-up
SENTIMENT_WEIGHT = 0.25  # sentiment of +1 shifts the forecast by 0.25 horizon-sigma
NEUTRAL_BAND = 0.2       # |forecast| below 0.2 horizon-sigma is reported as NEUTRAL
FEATURES = ["ret_1", "ret_2", "ret_5", "ret_10", "sma5_gap", "sma10_gap", "sma20_gap",
            "sma50_gap", "rsi14", "vol_ratio", "volatility_10"]
DISCLAIMER = ("Experimental estimate for academic demonstration only. Not financial advice; "
              "it does not guarantee future prices.")


def _rsi(close: pd.Series, n: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    loss = (-delta.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    rs = gain / loss.replace(0, np.nan)
    return (100 - 100 / (1 + rs)).fillna(100.0)


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    close, volume = df["Close"], df["Volume"].astype(float)
    ret = close.pct_change()
    f = pd.DataFrame(index=df.index)
    f["ret_1"] = ret
    f["ret_2"] = close.pct_change(2)
    f["ret_5"] = close.pct_change(5)
    f["ret_10"] = close.pct_change(10)
    for n in (5, 10, 20, 50):
        f[f"sma{n}_gap"] = close / close.rolling(n).mean() - 1
    f["rsi14"] = _rsi(close)
    f["vol_ratio"] = volume / volume.rolling(20).mean().replace(0, np.nan)
    f["volatility_10"] = ret.rolling(10).std()
    f["close"] = close
    return f.replace([np.inf, -np.inf], np.nan)


def technical_summary(symbol: str) -> dict:
    """Latest indicator values with plain-language reading (also used by the chatbot)."""
    df = stock_service.get_daily_history(symbol, "1y")
    f = build_features(df).dropna(subset=["rsi14", "sma20_gap"])
    if f.empty:
        raise InsufficientDataError("Not enough price history to compute indicators.")
    close = df["Close"]
    last = float(close.iloc[-1])
    sma20 = float(close.rolling(20).mean().iloc[-1])
    sma50 = float(close.rolling(50).mean().iloc[-1]) if len(close) >= 50 else None
    rsi = float(f["rsi14"].iloc[-1])
    rsi_signal = "overbought (>70)" if rsi > 70 else "oversold (<30)" if rsi < 30 else "neutral (30-70)"
    if sma50 is not None:
        trend = "uptrend (price above 20- and 50-day averages)" if last > sma20 and last > sma50 else \
                "downtrend (price below 20- and 50-day averages)" if last < sma20 and last < sma50 else "mixed trend"
    else:
        trend = "uptrend (price above 20-day average)" if last > sma20 else "downtrend (price below 20-day average)"
    mom = float(f["ret_10"].iloc[-1]) * 100 if pd.notna(f["ret_10"].iloc[-1]) else None
    return {
        "rsi_14": round(rsi, 1),
        "rsi_signal": rsi_signal,
        "sma_20": round(sma20, 2),
        "sma_50": round(sma50, 2) if sma50 else None,
        "trend": trend,
        "return_10d_pct": round(mom, 2) if mom is not None else None,
        "volatility_10d_pct": round(float(f["volatility_10"].iloc[-1]) * 100, 2),
    }


def _direction(ret: float, sigma_h: float) -> str:
    if abs(ret) < NEUTRAL_BAND * sigma_h:
        return "NEUTRAL"
    return "UP" if ret > 0 else "DOWN"


def _evaluate(name: str, y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2))) * 100
    acc = float(np.mean(np.sign(y_true) == np.sign(y_pred))) * 100
    return {"name": name, "accuracy": round(acc, 1), "rmse": round(rmse, 2)}


def _train_and_forecast(symbol: str, horizon: int) -> dict:
    df = stock_service.get_daily_history(symbol, "5y")
    feats = build_features(df)
    feats["target"] = feats["close"].shift(-horizon) / feats["close"] - 1
    usable = feats.dropna(subset=FEATURES + ["target"])
    if len(usable) < MIN_ROWS:
        raise InsufficientDataError(
            f"Only {len(usable)} usable trading days of history for {symbol}; at least {MIN_ROWS} are needed to train the model."
        )

    # Chronological split. The last `horizon` training rows are dropped so that the
    # training targets never overlap the test period (no look-ahead leakage).
    split = int(len(usable) * 0.8)
    train, test = usable.iloc[: split - horizon], usable.iloc[split:]
    X_tr, y_tr, X_te, y_te = train[FEATURES], train["target"], test[FEATURES], test["target"]

    rf = RandomForestRegressor(n_estimators=200, max_depth=6, min_samples_leaf=5, random_state=42, n_jobs=-1)
    lin = make_pipeline(StandardScaler(), Ridge(alpha=10.0))
    rf.fit(X_tr, y_tr)
    lin.fit(X_tr, y_tr)
    rf_te, lin_te = rf.predict(X_te), lin.predict(X_te)
    yt = y_te.to_numpy()

    always_up = {"name": "Always-UP baseline", "accuracy": round(float(np.mean(yt > 0)) * 100, 1),
                 "rmse": round(float(np.sqrt(np.mean(yt ** 2))) * 100, 2)}
    models = [_evaluate("Linear Regression (Ridge)", yt, lin_te), _evaluate("Random Forest", yt, rf_te), always_up]
    best = max(models, key=lambda m: m["accuracy"])
    best["best"] = True

    # Backtest chart: last 30 test predictions vs what actually happened `horizon` days later.
    tail = test.iloc[-30:]
    pred_tail = rf_te[-len(tail):]
    dates = df.index
    backtest = []
    for (ts, row), p in zip(tail.iterrows(), pred_tail):
        pos = dates.get_loc(ts)
        target_ts = dates[min(pos + horizon, len(dates) - 1)]
        backtest.append({
            "date": target_ts.date().isoformat(),
            "actual": round(float(row["close"] * (1 + row["target"])), 2),
            "predicted": round(float(row["close"] * (1 + p)), 2),
        })

    # Final model: refit on every labelled row, then forecast from the latest bar.
    rf_final = RandomForestRegressor(n_estimators=200, max_depth=6, min_samples_leaf=5, random_state=42, n_jobs=-1)
    rf_final.fit(usable[FEATURES], usable["target"])
    latest = feats.dropna(subset=FEATURES).iloc[[-1]]
    tech_return = float(rf_final.predict(latest[FEATURES])[0])
    daily_sigma = float(feats["ret_1"].tail(60).std())
    importances = sorted(zip(FEATURES, rf_final.feature_importances_), key=lambda x: -x[1])[:5]
    return {
        "tech_return": tech_return,
        "daily_sigma": daily_sigma,
        "last_close": float(latest["close"].iloc[0]),
        "last_date": latest.index[-1].date().isoformat(),
        "models": models,
        "backtest": backtest,
        "train_rows": len(train),
        "test_rows": len(test),
        "top_features": [{"feature": k, "importance": round(float(v), 3)} for k, v in importances],
    }


def predict(symbol: str, horizon_days: int = 1, use_sentiment: bool = True) -> dict:
    symbol = normalize_symbol(symbol)
    if horizon_days not in ALLOWED_HORIZONS:
        raise InvalidRequestError(f"horizon_days must be one of {ALLOWED_HORIZONS}.")

    base = cached(f"model:{symbol}:{horizon_days}", 900, lambda: _train_and_forecast(symbol, horizon_days))
    quote = stock_service.get_quote(symbol)

    sentiment_info = {"used": False, "score": 0.0, "articles_analyzed": 0, "overall_sentiment": None,
                      "adjustment_pct": 0.0, "note": "News sentiment not used."}
    if use_sentiment:
        try:
            s = sentiment_service.analyze_symbol(symbol)
            score = s["summary"]["overall_score"]
            sentiment_info.update(used=True, score=score, articles_analyzed=s["articles_analyzed"],
                                  overall_sentiment=s["summary"]["overall_sentiment"],
                                  note=f"Sentiment of {score:+.2f} from {s['articles_analyzed']} recent articles shifts the forecast by "
                                       f"{SENTIMENT_WEIGHT} x sentiment x expected move size (heuristic, not learned from data).")
        except AppError as exc:  # sentiment is optional: report why it is missing
            sentiment_info["note"] = f"Sentiment unavailable ({exc.message}); prediction uses technical features only."

    sigma_h = base["daily_sigma"] * math.sqrt(horizon_days)
    adjustment = sentiment_info["score"] * SENTIMENT_WEIGHT * sigma_h
    total = base["tech_return"] + adjustment
    sentiment_info["adjustment_pct"] = round(adjustment * 100, 2)

    price = quote["price"]
    rf_model = next(m for m in base["models"] if m["name"] == "Random Forest")
    return {
        "symbol": symbol,
        "currency": quote["currency"],
        "horizon_days": horizon_days,
        "horizon_label": "Next trading day" if horizon_days == 1 else f"Next {horizon_days} trading days",
        "current_price": price,
        "price_as_of": quote["data_as_of"],
        "predicted_price": round(price * (1 + total), 2),
        "expected_change_pct": round(total * 100, 2),
        "technical_component_pct": round(base["tech_return"] * 100, 2),
        "direction": _direction(total, sigma_h),
        "model_name": "Random Forest Regressor (200 trees) + sentiment adjustment",
        "backtest_directional_accuracy": rf_model["accuracy"],
        "sentiment": sentiment_info,
        "technical_indicators": technical_summary(symbol),
        "top_features": base["top_features"],
        "model_comparison": base["models"],
        "backtest": base["backtest"],
        "training": {"train_rows": base["train_rows"], "test_rows": base["test_rows"],
                     "features": FEATURES, "data_until": base["last_date"]},
        "disclaimer": DISCLAIMER,
    }

