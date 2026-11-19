from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.constants import ALLOWED_AIRPORTS, CITY_IATA, FALLBACK_AIRPORTS

logger = logging.getLogger(__name__)


def load_airports() -> list[dict]:
    payload = _fetch_dump()
    if payload is None:
        return [dict(row) for row in FALLBACK_AIRPORTS]
    mapped = _parse_dump(payload)
    if not mapped:
        return [dict(row) for row in FALLBACK_AIRPORTS]
    by_iata = {row["iata"]: row for row in FALLBACK_AIRPORTS}
    by_iata.update({row["iata"]: row for row in mapped})
    return [by_iata[code] for code in sorted(ALLOWED_AIRPORTS) if code in by_iata]


def _fetch_dump() -> Any | None:
    url = get_settings().data_dump_airports_url
    try:
        response = httpx.get(url, timeout=20.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as exc:
        logger.warning("Не удалось скачать справочник аэропортов: %s", exc)
        return None


def _parse_dump(payload: Any) -> list[dict]:
    items: list[Any]
    if isinstance(payload, list):
        items = payload
    elif isinstance(payload, dict):
        items = list(payload.values())
    else:
        return []
    rows: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        iata = str(item.get("code") or item.get("iata") or "").upper()
        if iata not in ALLOWED_AIRPORTS:
            continue
        coords = item.get("coordinates") or {}
        rows.append(
            {
                "iata": iata,
                "city": str(item.get("city_name") or item.get("name") or iata),
                "city_iata": str(item.get("city_code") or CITY_IATA.get(iata, iata)).upper(),
                "timezone": item.get("time_zone") or item.get("timezone"),
                "lat": _coord(coords, "lat"),
                "lon": _coord(coords, "lon"),
            }
        )
    return rows


def _coord(coords: Any, key: str) -> float | None:
    if not isinstance(coords, dict):
        return None
    value = coords.get(key)
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None
