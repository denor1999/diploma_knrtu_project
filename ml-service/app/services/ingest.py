from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.api.schemas import IngestResponse
from app.collectors.holidays import build_calendar
from app.collectors.static_data import load_airports
from app.collectors.synthetic import generate_observations
from app.collectors.travelpayouts import collect_live_observations
from app.core.config import get_settings
from app.core.constants import SEED_ROUTES
from app.db.models import Airport, CalendarDay, PriceObservation, Route


def run_ingest(db: Session, source: str) -> IngestResponse:
    resolved = _resolve_source(source)
    _upsert_airports(db, load_airports())
    _seed_routes(db)
    _upsert_calendar(db, build_calendar(2026, 2027))
    if resolved == "synthetic":
        observations = generate_observations()
    else:
        observations = collect_live_observations()
    written = _upsert_observations(db, observations)
    db.commit()
    return IngestResponse(
        source=resolved,
        airports=db.scalar(select(func.count()).select_from(Airport)) or 0,
        routes=db.scalar(select(func.count()).select_from(Route)) or 0,
        calendar_days=db.scalar(select(func.count()).select_from(CalendarDay)) or 0,
        observations=written,
    )


def _resolve_source(source: str) -> str:
    if source == "auto":
        return "live" if get_settings().travelpayouts_token else "synthetic"
    if source == "live" and not get_settings().travelpayouts_token:
        raise ValueError("Для live-ingest нужен TRAVELPAYOUTS_TOKEN.")
    return source


def _upsert_airports(db: Session, rows: list[dict]) -> None:
    for row in rows:
        db.merge(Airport(**row))
    db.flush()


def _seed_routes(db: Session) -> None:
    existing = {(route.origin, route.dest) for route in db.scalars(select(Route)).all()}
    for origin, dest, distance_km, international in SEED_ROUTES:
        if (origin, dest) in existing:
            continue
        db.add(Route(origin=origin, dest=dest, distance_km=distance_km, international=international))
    db.flush()


def _upsert_calendar(db: Session, rows: list[dict]) -> None:
    for row in rows:
        db.merge(CalendarDay(**row))
    db.flush()


def _upsert_observations(db: Session, rows: list[dict]) -> int:
    collapsed: dict[tuple, dict] = {}
    for row in rows:
        key = (row["origin"], row["dest"], row["departure_date"], row["collected_on"], row["source"])
        previous = collapsed.get(key)
        if previous is None or row["price_rub"] < previous["price_rub"]:
            collapsed[key] = row
    for row in collapsed.values():
        stmt = insert(PriceObservation).values(**row)
        stmt = stmt.on_conflict_do_update(
            constraint="uq_price_obs_route_day_source",
            set_={
                "price_rub": stmt.excluded.price_rub,
                "airline": stmt.excluded.airline,
                "transfers": stmt.excluded.transfers,
                "expires_at": stmt.excluded.expires_at,
                "raw_json": stmt.excluded.raw_json,
                "collected_at": stmt.excluded.collected_at,
                "return_date": stmt.excluded.return_date,
            },
        )
        db.execute(stmt)
    db.flush()
    return len(collapsed)
