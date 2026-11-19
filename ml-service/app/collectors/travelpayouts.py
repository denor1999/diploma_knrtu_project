from __future__ import annotations

import logging
from datetime import UTC, date, datetime, timedelta
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.constants import CITY_IATA, SEED_ROUTES, SOURCE_DATES, SOURCE_GROUPED

logger = logging.getLogger(__name__)


def collect_live_observations(months: int = 3) -> list[dict]:
    token = get_settings().travelpayouts_token
    if not token:
        raise RuntimeError("TRAVELPAYOUTS_TOKEN не задан.")
    collected_at = datetime.now(tz=UTC)
    collected_on = collected_at.date()
    rows: list[dict] = []
    start = date.today().replace(day=1)
    for origin, dest, _distance, _intl in SEED_ROUTES:
        for month_offset in range(months):
            month = (start + timedelta(days=32 * month_offset)).replace(day=1)
            month_key = month.strftime("%Y-%m")
            grouped = _grouped_prices(token, origin, dest, month_key)
            rows.extend(_rows_from_grouped(grouped, origin, dest, collected_at, collected_on))
            detailed = _prices_for_dates(token, origin, dest, month_key)
            rows.extend(_rows_from_dates(detailed, origin, dest, collected_at, collected_on))
    return rows


def _grouped_prices(token: str, origin: str, dest: str, month: str) -> dict[str, Any]:
    return _get(
        "/aviasales/v3/grouped_prices",
        token,
        {
            "origin": origin,
            "destination": dest,
            "departure_at": month,
            "group_by": "departure_at",
            "currency": "rub",
            "market": "ru",
            "one_way": "true",
        },
        origin,
        dest,
        month,
    )


def _prices_for_dates(token: str, origin: str, dest: str, month: str) -> dict[str, Any]:
    return _get(
        "/aviasales/v3/prices_for_dates",
        token,
        {
            "origin": origin,
            "destination": dest,
            "departure_at": month,
            "sorting": "price",
            "direct": "false",
            "cy": "rub",
            "limit": 30,
            "page": 1,
            "one_way": "true",
            "unique": "false",
        },
        origin,
        dest,
        month,
    )


def _get(path: str, token: str, params: dict[str, str], origin: str, dest: str, month: str) -> dict[str, Any]:
    settings = get_settings()
    headers = {"X-Access-Token": token, "Accept-Encoding": "gzip, deflate"}
    query = {**params, "token": token}
    try:
        response = httpx.get(f"{settings.travelpayouts_base_url}{path}", params=query, headers=headers, timeout=20.0)
        response.raise_for_status()
        payload = response.json()
        if payload.get("success") is False and CITY_IATA.get(origin) and CITY_IATA[origin] != origin:
            query["origin"] = CITY_IATA[origin]
            response = httpx.get(
                f"{settings.travelpayouts_base_url}{path}",
                params=query,
                headers=headers,
                timeout=20.0,
            )
            response.raise_for_status()
            payload = response.json()
        return payload if isinstance(payload, dict) else {}
    except httpx.HTTPError as exc:
        logger.warning("Travelpayouts %s %s→%s %s: %s", path, origin, dest, month, exc)
        return {}


def _rows_from_grouped(
    payload: dict[str, Any],
    origin: str,
    dest: str,
    collected_at: datetime,
    collected_on: date,
) -> list[dict]:
    data = payload.get("data") or {}
    if not isinstance(data, dict):
        return []
    rows: list[dict] = []
    for key, ticket in data.items():
        if not isinstance(ticket, dict):
            continue
        parsed = _ticket_row(ticket, origin, dest, collected_at, collected_on, SOURCE_GROUPED, key)
        if parsed:
            rows.append(parsed)
    return rows


def _rows_from_dates(
    payload: dict[str, Any],
    origin: str,
    dest: str,
    collected_at: datetime,
    collected_on: date,
) -> list[dict]:
    data = payload.get("data") or []
    items = data.values() if isinstance(data, dict) else data
    rows: list[dict] = []
    for ticket in items:
        if not isinstance(ticket, dict):
            continue
        parsed = _ticket_row(ticket, origin, dest, collected_at, collected_on, SOURCE_DATES)
        if parsed:
            rows.append(parsed)
    return rows


def _ticket_row(
    ticket: dict[str, Any],
    origin: str,
    dest: str,
    collected_at: datetime,
    collected_on: date,
    source: str,
    fallback_date: str | None = None,
) -> dict | None:
    price = ticket.get("price") or ticket.get("value")
    if price is None:
        return None
    departure = _parse_date(ticket.get("departure_at") or ticket.get("depart_date") or fallback_date)
    if departure is None:
        return None
    return_date = _parse_date(ticket.get("return_at") or ticket.get("return_date"))
    origin_code = str(ticket.get("origin_airport") or origin).upper()
    dest_code = str(ticket.get("destination_airport") or dest).upper()
    return {
        "origin": origin_code,
        "dest": dest_code,
        "departure_date": departure,
        "return_date": return_date,
        "collected_at": collected_at,
        "collected_on": collected_on,
        "price_rub": int(price),
        "airline": ticket.get("airline") or ticket.get("airline_code"),
        "transfers": ticket.get("transfers") if ticket.get("transfers") is not None else ticket.get("number_of_changes"),
        "source": source,
        "expires_at": _parse_datetime(ticket.get("expires_at")),
        "raw_json": ticket,
    }


def _parse_date(value: Any) -> date | None:
    if value is None:
        return None
    text = str(value)[:10]
    try:
        return date.fromisoformat(text)
    except ValueError:
        return None


def _parse_datetime(value: Any) -> datetime | None:
    if not value:
        return None
    text = str(value).replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed
