"""Financial news from Google News RSS (free, no API key)."""
import html
import logging
import re
from datetime import datetime, timezone
from urllib.parse import quote_plus

import feedparser
import requests

from app.core.cache import cached, peek, put
from app.core.errors import NewsUnavailableError
from app.core.stocks import get_supported, is_indian, normalize_symbol

log = logging.getLogger("finsight.news")
NEWS_TTL = 600  # 10 minutes

CATEGORY_QUERIES = {
    "market": "Sensex OR Nifty OR \"Wall Street\" stock market",
    "economy": "economy inflation interest rates",
    "banking": "banking sector",
    "it": "IT services technology stocks",
    "energy": "oil energy stocks",
    "automotive": "auto sector EV sales",
}


def _clean(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def _company_terms(symbol: str | None, company: str | None) -> tuple[str | None, list[str]]:
    """Return (display name, relevance keywords) for a symbol/company."""
    keywords: list[str] = []
    name = company
    if symbol:
        info = get_supported(symbol)
        if info:
            name = name or info["name"]
            keywords = list(info["keywords"])
        else:
            base = normalize_symbol(symbol).split(".")[0].lower()
            keywords = [base]
    if name:
        keywords.append(name.lower())
        keywords.append(name.lower().split()[0])
    return name, sorted(set(k for k in keywords if len(k) > 1))


def _feed_url(query: str, indian: bool) -> str:
    region = "hl=en-IN&gl=IN&ceid=IN:en" if indian else "hl=en-US&gl=US&ceid=US:en"
    return f"https://news.google.com/rss/search?q={quote_plus(query)}&{region}"


def _fetch(query: str, indian: bool) -> list:
    try:
        resp = requests.get(_feed_url(query, indian), timeout=10, headers={"User-Agent": "Mozilla/5.0 FinSight-academic-demo"})
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise NewsUnavailableError(f"News feed could not be fetched ({exc.__class__.__name__}).") from exc
    return feedparser.parse(resp.content).entries


def get_news(
    symbol: str | None = None,
    company: str | None = None,
    category: str | None = None,
    limit: int = 10,
) -> dict:
    symbol = normalize_symbol(symbol) if symbol else None
    name, keywords = _company_terms(symbol, company)
    limit = max(1, min(limit, 30))

    if name:
        query = f'"{name}" (stock OR shares) when:7d'
    elif category and category.lower() in CATEGORY_QUERIES:
        query = f"{CATEGORY_QUERIES[category.lower()]} when:3d"
    else:
        query = "Sensex OR Nifty OR \"Wall Street\" stock market when:2d"
    indian = is_indian(symbol) if symbol else True  # general market news defaults to the Indian edition

    key = f"news:{query}:{indian}"
    stale_key = f"news-stale:{key}"

    def build() -> dict:
        entries = _fetch(query, indian)
        articles, seen = [], set()
        for e in entries:
            raw_title = _clean(e.get("title", ""))
            source = (e.get("source") or {}).get("title") or ""
            title = raw_title
            if source and raw_title.endswith(f" - {source}"):
                title = raw_title[: -len(source) - 3]
            elif " - " in raw_title and not source:
                title, source = raw_title.rsplit(" - ", 1)
            if not title or title.lower() in seen:
                continue
            if keywords and not any(k in title.lower() for k in keywords):
                continue  # unrelated article
            seen.add(title.lower())
            summary = _clean(e.get("summary", ""))
            if summary.lower().startswith(title.lower()[:40]):
                summary = ""  # Google News repeats the headline; don't pretend it is a summary
            published = None
            if e.get("published_parsed"):
                published = datetime(*e.published_parsed[:6], tzinfo=timezone.utc).isoformat()
            articles.append(
                {
                    "title": title,
                    "description": summary,
                    "source": source or "Unknown",
                    "published": published,
                    "url": e.get("link", ""),
                    "symbol": symbol,
                    "company": name,
                }
            )
        articles.sort(key=lambda a: a["published"] or "", reverse=True)
        return {
            "symbol": symbol,
            "company": name,
            "category": category,
            "count": len(articles),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "cached": False,
            "stale": False,
            "source": "Google News RSS",
            "articles": articles[:30],
        }

    try:
        result = cached(key, NEWS_TTL, build)
        put(stale_key, 86400, result)  # day-long copy used only if the feed is down later
    except NewsUnavailableError:
        stale = peek(stale_key)
        if stale:
            result = {**stale, "stale": True, "cached": True}
        else:
            raise
    out = dict(result)
    out["articles"] = result["articles"][:limit]
    out["count"] = len(out["articles"])
    return out

