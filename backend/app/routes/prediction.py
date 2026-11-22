from fastapi import APIRouter

from app.schemas.responses import PredictionRequest
from app.services import prediction_service

router = APIRouter(prefix="/predictions", tags=["Prediction"])


@router.post("/{symbol}", summary="Experimental price estimate (Random Forest + news sentiment)")
def predict(symbol: str, req: PredictionRequest | None = None):
    req = req or PredictionRequest()
    return prediction_service.predict(symbol, req.horizon_days, req.use_sentiment)
