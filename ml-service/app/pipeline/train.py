from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import func, select, update

from app.db.models import FeatureRow, ModelRegistry, PriceObservation
from app.db.session import SessionLocal
from app.pipeline.features import rebuild_feature_rows
from app.services.heuristic import HEURISTIC_VERSION

MODELS_DIR = Path(__file__).resolve().parents[2] / "models"


def run() -> dict:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    artifact = MODELS_DIR / f"{HEURISTIC_VERSION}.txt"
    artifact.write_text("heuristic placeholder — replace with joblib in the next slice\n", encoding="utf-8")
    with SessionLocal() as db:
        observation_count = db.scalar(select(func.count()).select_from(PriceObservation)) or 0
        feature_count = rebuild_feature_rows(db) if observation_count else 0
        labeled = db.scalar(
            select(func.count()).select_from(FeatureRow).where(FeatureRow.target_price_7d.is_not(None))
        ) or 0
        metrics = {
            "observations": observation_count,
            "feature_rows": feature_count,
            "labeled_rows": labeled,
            "model": HEURISTIC_VERSION,
        }
        db.execute(update(ModelRegistry).values(is_active=False))
        existing = db.scalar(select(ModelRegistry).where(ModelRegistry.version == HEURISTIC_VERSION))
        if existing:
            existing.path = str(artifact)
            existing.metrics_json = metrics
            existing.is_active = True
            existing.trained_at = datetime.now(tz=UTC)
        else:
            db.add(
                ModelRegistry(
                    version=HEURISTIC_VERSION,
                    path=str(artifact),
                    trained_at=datetime.now(tz=UTC),
                    metrics_json=metrics,
                    is_active=True,
                )
            )
        db.commit()
        return metrics


if __name__ == "__main__":
    print(run())
