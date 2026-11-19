from __future__ import annotations

from collections import defaultdict
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db.models import CalendarDay, FeatureRow, PriceObservation


def rebuild_feature_rows(db: Session) -> int:
    observations = db.scalars(select(PriceObservation)).all()
    calendar = {row.date: row for row in db.scalars(select(CalendarDay)).all()}
    prices: dict[tuple, int] = {}
    airlines: dict[tuple, set[str]] = defaultdict(set)
    for obs in observations:
        key = (obs.origin, obs.dest, obs.departure_date, obs.collected_on)
        previous = prices.get(key)
        if previous is None or obs.price_rub < previous:
            prices[key] = obs.price_rub
        if obs.airline:
            airlines[(obs.origin, obs.dest, obs.collected_on)].add(obs.airline)

    count = 0
    for (origin, dest, departure, collected_on), current_price in prices.items():
        cal = calendar.get(departure)
        stmt = insert(FeatureRow).values(
            origin=origin,
            dest=dest,
            departure_date=departure,
            collected_on=collected_on,
            days_to_departure=(departure - collected_on).days,
            current_price=current_price,
            lag_1=prices.get((origin, dest, departure, collected_on - timedelta(days=1))),
            lag_7=prices.get((origin, dest, departure, collected_on - timedelta(days=7))),
            lag_14=prices.get((origin, dest, departure, collected_on - timedelta(days=14))),
            month=departure.month,
            is_ru_holiday=cal.is_ru_holiday if cal else False,
            days_to_holiday=cal.days_to_holiday if cal else None,
            unique_airlines_window=_airline_window(airlines, origin, dest, collected_on),
            target_price_7d=prices.get((origin, dest, departure, collected_on + timedelta(days=7))),
        )
        stmt = stmt.on_conflict_do_update(
            constraint="uq_feature_rows_route_day",
            set_={
                "days_to_departure": stmt.excluded.days_to_departure,
                "current_price": stmt.excluded.current_price,
                "lag_1": stmt.excluded.lag_1,
                "lag_7": stmt.excluded.lag_7,
                "lag_14": stmt.excluded.lag_14,
                "month": stmt.excluded.month,
                "is_ru_holiday": stmt.excluded.is_ru_holiday,
                "days_to_holiday": stmt.excluded.days_to_holiday,
                "unique_airlines_window": stmt.excluded.unique_airlines_window,
                "target_price_7d": stmt.excluded.target_price_7d,
            },
        )
        db.execute(stmt)
        count += 1
    db.commit()
    return count


def _airline_window(airlines: dict[tuple, set[str]], origin: str, dest: str, collected_on) -> int:
    names: set[str] = set()
    for offset in range(0, 8):
        names.update(airlines.get((origin, dest, collected_on - timedelta(days=offset)), set()))
    return len(names)
