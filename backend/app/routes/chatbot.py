from fastapi import APIRouter

from app.schemas.responses import ChatRequest
from app.services import chatbot_service

router = APIRouter(tags=["Chatbot"])


@router.post("/chat", summary="Financial research chatbot (OpenAI + live market/news context)")
def chat(req: ChatRequest):
    portfolio = [p.model_dump() for p in req.portfolio] if req.portfolio else None
    return chatbot_service.chat(
        req.message, req.symbol, [m.model_dump() for m in req.history], portfolio
    )
