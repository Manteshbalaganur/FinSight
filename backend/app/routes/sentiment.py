from fastapi import APIRouter

from app.schemas.responses import SentimentRequest
from app.services import news_service, sentiment_service

router = APIRouter(prefix="/sentiment", tags=["Sentiment"])


@router.post("/analyze", summary="OpenAI sentiment analysis of news articles for a stock")
def analyze(req: SentimentRequest):
    if req.articles:
        articles = [a.model_dump() for a in req.articles]
        company = req.company
    else:
        news = news_service.get_news(symbol=req.symbol, company=req.company, limit=10)
        articles, company = news["articles"], req.company or news.get("company")
    return sentiment_service.analyze(req.symbol, company, articles)
