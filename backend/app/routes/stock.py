from fastapi import APIRouter, Query

from app.services import stock_service

router = APIRouter(prefix="/stocks", tags=["Stocks"])


# NOTE: fixed paths must be declared before "/{symbol}".
@router.get("/search", summary="Search supported stocks by ticker or company name")
def search(q: str = Query(..., min_length=1, description="Ticker or company name, e.g. 'reli' or 'apple'")):
    return {"query": q, "results": stock_service.search_stocks(q)}


@router.get("/supported", summary="List the demo stock universe (Indian and international)")
def supported():
    from app.core.stocks import SUPPORTED_STOCKS

    return {"stocks": [{"symbol": s["symbol"], "name": s["name"], "market": s["market"]} for s in SUPPORTED_STOCKS]}


@router.get("/quotes", summary="Latest price and day change for several symbols")
def quotes(symbols: str = Query(..., description="Comma-separated, e.g. TCS.NS,AAPL")):
    items = [s for s in symbols.split(",") if s.strip()][:30]
    return {"quotes": stock_service.get_batch_quotes(items)}


@router.get("/{symbol}/history", summary="Historical prices for charts")
def history(symbol: str, period: str = Query("1M", description="1D, 1W, 1M, 3M, 6M, 1Y or 5Y")):
    return stock_service.get_history(symbol, period)


@router.get("/{symbol}", summary="Latest available stock information")
def stock_info(symbol: str):
    return stock_service.get_quote(symbol)
