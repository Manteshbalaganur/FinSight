import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.errors import AppError
from app.routes import chatbot, market, news, prediction, sentiment, stock

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

app = FastAPI(
    title="FinSight API",
    description="Backend for the Stock Price Prediction Using News Sentiment Analysis academic project. "
    "Market data: Yahoo Finance (may be delayed). Predictions are experimental and not financial advice.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"}),
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",  # any local dev port (Next uses 3001 if 3000 is busy)
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message, "code": exc.code})


@app.exception_handler(Exception)
async def unexpected_error_handler(_: Request, exc: Exception):
    logging.getLogger("finsight").exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Unexpected server error. See the backend terminal.", "code": "internal_error"})


for module in (stock, news, sentiment, prediction, chatbot, market):
    app.include_router(module.router, prefix="/api")


@app.get("/", include_in_schema=False)
def root():
    return {"app": "FinSight API", "docs": "/docs"}
