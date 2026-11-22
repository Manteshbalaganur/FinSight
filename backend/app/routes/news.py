from fastapi import APIRouter, Query

from app.services import news_service

router = APIRouter(prefix="/news", tags=["News"])


@router.get("", summary="Latest financial news (Google News RSS)")
def get_news(
    symbol: str | None = Query(None, description="e.g. RELIANCE.NS or AAPL"),
    company: str | None = Query(None),
    category: str | None = Query(None, description="market, economy, banking, it, energy, automotive"),
    limit: int = Query(10, ge=1, le=30),
):
    return news_service.get_news(symbol=symbol, company=company, category=category, limit=limit)
