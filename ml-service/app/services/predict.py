from __future__ import annotations

import logging

from app.api.schemas import PredictRequest, PredictResponse
from app.db.models import InferenceLog
from app.db.session import SessionLocal
from app.services.heuristic import HEURISTIC_VERSION, build_quote

logger = logging.getLogger(__name__)


def predict(request: PredictRequest) -> PredictResponse:
    quote = build_quote(request.origin, request.dest, request.date)
    _log_inference(quote)
    return quote


def _log_inference(quote: PredictResponse) -> None:
    try:
        with SessionLocal() as db:
            db.add(
                InferenceLog(
                    origin=quote.from_,
                    dest=quote.to,
                    date=quote.date,
                    predicted=quote.expected,
                    rec=quote.rec,
                    model_version=HEURISTIC_VERSION,
                )
            )
            db.commit()
    except Exception:
        logger.warning("Не удалось записать inference_log", exc_info=True)
