from fastapi import APIRouter

from app.core.openai_client import check_model
from app.services import stock_service

router = APIRouter(tags=["Market"])


@router.get("/market/overview", summary="Index levels, top gainers and losers (supported stocks)")
def overview():
    return stock_service.get_market_overview()


@router.get("/health", summary="Backend status and OpenAI configuration check")
def health():
    return {"status": "ok", "openai": check_model()}
