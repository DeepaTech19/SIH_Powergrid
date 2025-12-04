# routes/prediction_routes.py
from fastapi import APIRouter

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("/ping")
def ping_prediction():
    return {"status": "prediction routes alive"}
