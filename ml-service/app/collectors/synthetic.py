from datetime import UTC, date, datetime, timedelta
from math import sin

from app.core.constants import REFERENCE_DATE, SEED_ROUTES, SOURCE_SYNTHETIC
from app.services.heuristic import PROFILES


def generate_observations(collected_on: date | None = None) -> list[dict]:
    collected = collected_on or date.today()
    collected_at = datetime(collected.year, collected.month, collected.day, 12, 0, tzinfo=UTC)
    rows: list[dict] = []
    for origin, dest, _distance, _intl in SEED_ROUTES:
        profile = PROFILES.get(dest, PROFILES["AER"])
        seed = sum(map(ord, dest))
        for offset in range(30, -1, -1):
            departure = REFERENCE_DATE + timedelta(days=offset)
            wave = sin((offset + seed) / 2.4) * profile.current * 0.04
            price = max(1000, int(round(profile.current + wave + offset * profile.delta_day * 0.05)))
            rows.append(
                {
                    "origin": origin,
                    "dest": dest,
                    "departure_date": departure,
                    "return_date": None,
                    "collected_at": collected_at,
                    "collected_on": collected,
                    "price_rub": price,
                    "airline": "SU",
                    "transfers": 0,
                    "source": SOURCE_SYNTHETIC,
                    "expires_at": None,
                    "raw_json": {"synthetic": True, "offset": offset},
                }
            )
    return rows
