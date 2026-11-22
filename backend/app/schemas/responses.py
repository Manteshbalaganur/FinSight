"""Request bodies (validated by FastAPI) shared by the routes."""
from typing import Literal

from pydantic import BaseModel, Field


class ArticleIn(BaseModel):
    title: str
    description: str | None = ""
    source: str | None = None
    published: str | None = None
    url: str | None = ""


class SentimentRequest(BaseModel):
    symbol: str = Field(examples=["RELIANCE.NS"])
    company: str | None = None
    articles: list[ArticleIn] | None = Field(
        default=None, description="Articles to analyse. If omitted, the backend fetches the latest news for the symbol."
    )


class PredictionRequest(BaseModel):
    horizon_days: Literal[1, 5, 7] = Field(default=1, description="Trading days ahead: 1, 5 or 7")
    use_sentiment: bool = True


class ChatMessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class PortfolioPosition(BaseModel):
    symbol: str
    qty: float
    buy_price: float


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    symbol: str | None = None
    history: list[ChatMessageIn] = []
    portfolio: list[PortfolioPosition] | None = None
