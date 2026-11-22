"""Market data from Yahoo Finance (yfinance).

Yahoo data can be delayed (often ~15 minutes, sometimes end-of-day only) so every
response carries the timestamp of the latest bar we actually received.
"""
import logging
import time
from datetime import datetime, timezone

import pandas as pd
import yfinance as yf

from app.core.cache import cached
from app.core.errors import DataUnavailableError, InvalidRequestError, InvalidSymbolError
from app.core.stocks import INDICES, SUPPORTED_STOCKS, get_supported, normalize_symbol

log = logging.getLogger("finsight.stock")

HISTORY_TTL = 300  # 5 min
QUOTE_TTL = 60

# period label -> (yfinance period, interval)
PERIODS = {
    "1D": ("5d", "5m"),   # last trading session only (trimmed below)
    "1W": ("5d", "30m"),
    "1M": ("1mo", "1d"),
    "3M": ("3mo", "1d"),
    "6M": ("6mo", "1d"),
    "1Y": ("1y", "1d"),
    "5Y": ("5y", "1wk"),
}


def _download_history(symbol: str, period: str, interval: str) -> tuple[pd.DataFrame, dict]:
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval, timeout=15)
        meta = {}
        try:
            meta = dict(ticker.history_metadata or {})
        except Exception:  # metadata is optional
            pass
    except Exception as exc:
        log.warning("yfinance failed for %s: %s", symbol, exc)
        raise DataUnavailableError(
            f"Could not reach Yahoo Finance for {symbol}. Please try again shortly."
        ) from exc
    if df is None or df.empty:
        raise InvalidSymbolError(
            f"No market data found for '{symbol}'. Check the symbol (Indian stocks need the .NS suffix, e.g. TCS.NS)."
        )
    df = df.dropna(subset=["Close"])
    if df.empty:
        raise InvalidSymbolError(f"No market data found for '{symbol}'.")
    return df, meta


def get_daily_history(symbol: str, period: str = "1y") -> pd.DataFrame:
    """Daily OHLCV dataframe (cached). Used by quotes, indicators and the ML model."""
    symbol = normalize_symbol(symbol)
    df, _ = cached(
        f"daily:{symbol}:{period}", HISTORY_TTL, lambda: _download_history(symbol, period, "1d")
    )
    return df


def _daily_with_meta(symbol: str, period: str = "1y") -> tuple[pd.DataFrame, dict]:
    return cached(
        f"daily:{symbol}:{period}", HISTORY_TTL, lambda: _download_history(symbol, period, "1d")
    )


def _to_dt(value) -> datetime | None:
    """Yahoo metadata gives epoch seconds or pandas Timestamps depending on yfinance version."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value, tz=timezone.utc)
    ts = pd.Timestamp(value)
    if ts.tzinfo is None:
        ts = ts.tz_localize("UTC")
    return ts.to_pydatetime()


def _market_state(meta: dict, last_bar: pd.Timestamp) -> dict:
    now = datetime.now(timezone.utc)
    is_open = None
    try:
        regular = meta["currentTradingPeriod"]["regular"]
        is_open = _to_dt(regular["start"]) <= now <= _to_dt(regular["end"])
    except Exception:
        pass
    if is_open is True:
        note = "Market is open. Prices may be delayed by Yahoo Finance."
    elif is_open is False:
        note = f"Market is closed. Showing the latest available close ({last_bar.date().isoformat()})."
    else:
        note = "Market status unknown. Showing the latest available data from Yahoo Finance."
    return {"market_open": is_open, "market_status_note": note}


def get_quote(symbol: str) -> dict:
    symbol = normalize_symbol(symbol)

    def build() -> dict:
        df, meta = _daily_with_meta(symbol)
        last = df.iloc[-1]
        prev_close = float(df["Close"].iloc[-2]) if len(df) > 1 else float(last["Close"])
        price = float(last["Close"])
        change = price - prev_close
        supported = get_supported(symbol)
        name = meta.get("longName") or meta.get("shortName") or (supported or {}).get("name") or symbol
        last_ts = df.index[-1]
        data_as_of = last_ts.to_pydatetime()
        try:
            data_as_of = _to_dt(meta.get("regularMarketTime")) or data_as_of
        except Exception:
            pass
        return {
            "symbol": symbol,
            "name": name,
            "currency": meta.get("currency") or ("INR" if symbol.endswith((".NS", ".BO")) else "USD"),
            "exchange": meta.get("fullExchangeName") or meta.get("exchangeName"),
            "price": round(price, 2),
            "previous_close": round(prev_close, 2),
            "change": round(change, 2),
            "change_percent": round(change / prev_close * 100, 2) if prev_close else 0.0,
            "open": round(float(last["Open"]), 2),
            "day_high": round(float(last["High"]), 2),
            "day_low": round(float(last["Low"]), 2),
            "volume": int(last["Volume"]) if pd.notna(last["Volume"]) else None,
            "fifty_two_week_high": round(float(df["High"].max()), 2),
            "fifty_two_week_low": round(float(df["Low"].min()), 2),
            "latest_bar_date": last_ts.date().isoformat(),
            "data_as_of": data_as_of.isoformat(),
            "data_source": "Yahoo Finance via yfinance (may be delayed; not tick-by-tick real-time)",
            **_market_state(meta, last_ts),
        }

    return cached(f"quote:{symbol}", QUOTE_TTL, build)


def get_history(symbol: str, period: str = "1M") -> dict:
    symbol = normalize_symbol(symbol)
    period = period.upper()
    if period not in PERIODS:
        raise InvalidRequestError(f"Unsupported period '{period}'. Use one of: {', '.join(PERIODS)}")
    yf_period, interval = PERIODS[period]

    def build() -> dict:
        df, meta = _download_history(symbol, yf_period, interval)
        if period == "1D":  # keep only the most recent trading session
            last_day = df.index[-1].date()
            df = df[[d.date() == last_day for d in df.index]]
        intraday = interval.endswith("m")
        points = []
        for ts, row in df.iterrows():
            points.append(
                {
                    "date": ts.isoformat() if intraday else ts.date().isoformat(),
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]) if pd.notna(row["Volume"]) else 0,
                }
            )
        return {
            "symbol": symbol,
            "period": period,
            "interval": interval,
            "currency": meta.get("currency") or ("INR" if symbol.endswith((".NS", ".BO")) else "USD"),
            "intraday": intraday,
            "count": len(points),
            "latest_bar": points[-1]["date"] if points else None,
            "points": points,
        }

    return cached(f"history:{symbol}:{period}", HISTORY_TTL, build)


def search_stocks(query: str, limit: int = 8) -> list[dict]:
    q = query.strip().lower()
    if not q:
        return []
    results = []
    for s in SUPPORTED_STOCKS:
        base = s["symbol"].split(".")[0].lower()
        if q in s["symbol"].lower() or q in s["name"].lower() or q == base or q in ("tatamotors", "tata motors") and base == "tmpv":
            results.append({"symbol": s["symbol"], "name": s["name"], "market": s["market"], "supported": True})
    if not results and len(q) >= 2:  # best-effort Yahoo lookup for stocks outside the demo list
        try:
            found = cached(f"search:{q}", 600, lambda: yf.Search(query, max_results=limit, news_count=0).quotes)
            for item in found:
                if item.get("quoteType") in ("EQUITY", "ETF") and item.get("symbol"):
                    results.append(
                        {
                            "symbol": item["symbol"],
                            "name": item.get("shortname") or item.get("longname") or item["symbol"],
                            "market": item.get("exchDisp") or "Other",
                            "supported": False,
                        }
                    )
        except Exception as exc:
            log.info("Yahoo search unavailable: %s", exc)
    return results[:limit]


def get_batch_quotes(symbols: list[str]) -> list[dict]:
    """Latest close and day change for many symbols using one Yahoo request."""
    symbols = [normalize_symbol(s) for s in symbols]
    key = "batch:" + ",".join(sorted(symbols))

    def build() -> list[dict]:
        try:
            data = yf.download(
                symbols, period="5d", interval="1d", group_by="ticker",
                progress=False, threads=True, auto_adjust=True, timeout=20,
            )
        except Exception as exc:
            raise DataUnavailableError("Could not reach Yahoo Finance for batch quotes.") from exc
        out = []
        for sym in symbols:
            try:
                closes = (data[sym]["Close"] if len(symbols) > 1 or isinstance(data.columns, pd.MultiIndex) else data["Close"]).dropna()
                if len(closes) < 1:
                    raise ValueError("empty")
                price = float(closes.iloc[-1])
                prev = float(closes.iloc[-2]) if len(closes) > 1 else price
                supported = get_supported(sym)
                out.append(
                    {
                        "symbol": sym,
                        "name": (supported or {}).get("name") or next((i["name"] for i in INDICES if i["symbol"] == sym), sym),
                        "price": round(price, 2),
                        "previous_close": round(prev, 2),
                        "change": round(price - prev, 2),
                        "change_percent": round((price - prev) / prev * 100, 2) if prev else 0.0,
                        "latest_bar_date": closes.index[-1].date().isoformat(),
                        "available": True,
                    }
                )
            except Exception:
                out.append({"symbol": sym, "name": sym, "available": False})
        return out

    return cached(key, QUOTE_TTL, build)


def get_market_overview() -> dict:
    """Index levels plus gainers/losers across the supported stock list."""
    index_quotes = get_batch_quotes([i["symbol"] for i in INDICES])
    stock_quotes = get_batch_quotes([s["symbol"] for s in SUPPORTED_STOCKS])
    ok = sorted((q for q in stock_quotes if q.get("available")), key=lambda q: q["change_percent"], reverse=True)
    return {
        "indices": index_quotes,
        "top_gainers": ok[:3],
        "top_losers": list(reversed(ok[-3:])) if len(ok) >= 3 else [],
        "universe_size": len(SUPPORTED_STOCKS),
        "note": "Gainers/losers are computed over the supported demo stock list only, not the full market.",
        "data_source": "Yahoo Finance via yfinance (may be delayed)",
    }


