from fastapi import FastAPI, Header, HTTPException
from sqlalchemy import text

from app.api.schemas import HealthResponse, IngestRequest, IngestResponse, PredictRequest, PredictResponse
from app.core.config import get_settings
from app.db.session import SessionLocal, engine
from app.services.heuristic import HEURISTIC_VERSION
from app.services.ingest import run_ingest
from app.services.predict import predict as predict_quote

app = FastAPI(title="vovremya ML", version="0.1.0")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    database = "unavailable"
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        database = "ok"
    except Exception:
        database = "unavailable"
    return HealthResponse(status="ok", database=database, model_version=HEURISTIC_VERSION)


@app.post("/v1/predict", response_model=PredictResponse)
def predict(body: PredictRequest) -> PredictResponse:
    return predict_quote(body)


@app.post("/v1/ingest", response_model=IngestResponse)
def ingest(
    body: IngestRequest | None = None,
    x_ml_ingest_token: str | None = Header(default=None, alias="X-ML-Ingest-Token"),
) -> IngestResponse:
    settings = get_settings()
    if not settings.ml_ingest_token or x_ml_ingest_token != settings.ml_ingest_token:
        raise HTTPException(status_code=401, detail="Нужен заголовок X-ML-Ingest-Token.")
    payload = body or IngestRequest()
    try:
        with SessionLocal() as db:
            return run_ingest(db, payload.source)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
