from app.collectors.synthetic import generate_observations
from app.core.constants import SEED_ROUTES, SOURCE_SYNTHETIC


def test_synthetic_covers_seed_routes() -> None:
    rows = generate_observations()
    pairs = {(row["origin"], row["dest"]) for row in rows}
    assert pairs == {(origin, dest) for origin, dest, _km, _intl in SEED_ROUTES}
    assert all(row["source"] == SOURCE_SYNTHETIC for row in rows)
    assert len(rows) == len(SEED_ROUTES) * 31
    assert all(row["price_rub"] >= 1000 for row in rows)
