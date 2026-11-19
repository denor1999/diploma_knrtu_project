from __future__ import annotations

import logging
from datetime import date, timedelta

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def build_calendar(year_from: int, year_to: int) -> list[dict]:
    holidays = _load_holidays(year_from, year_to)
    start = date(year_from, 1, 1)
    end = date(year_to, 12, 31)
    days: list[date] = []
    cursor = start
    while cursor <= end:
        days.append(cursor)
        cursor += timedelta(days=1)
    holiday_dates = sorted(day for day, flag in holidays.items() if flag)
    rows: list[dict] = []
    for day in days:
        is_weekend = day.weekday() >= 5
        is_holiday = holidays.get(day, False)
        rows.append(
            {
                "date": day,
                "weekday": day.weekday(),
                "month": day.month,
                "is_weekend": is_weekend,
                "is_ru_holiday": is_holiday,
                "days_to_holiday": _days_to_holiday(day, holiday_dates),
            }
        )
    return rows


def _load_holidays(year_from: int, year_to: int) -> dict[date, bool]:
    flags: dict[date, bool] = {}
    for year in range(year_from, year_to + 1):
        payload = _fetch_year(year)
        if payload is None:
            continue
        cursor = date(year, 1, 1)
        for index, mark in enumerate(payload):
            day = cursor + timedelta(days=index)
            flags[day] = mark == "1"
    return flags


def _fetch_year(year: int) -> str | None:
    settings = get_settings()
    try:
        response = httpx.get(settings.isdayoff_url, params={"year": year, "cc": "ru"}, timeout=20.0)
        response.raise_for_status()
        text = response.text.strip()
        if len(text) >= 365 and all(char in "01234" for char in text):
            return text
        logger.warning("Неожиданный ответ isdayoff за %s", year)
        return None
    except httpx.HTTPError as exc:
        logger.warning("Не удалось получить календарь isdayoff за %s: %s", year, exc)
        return None


def _days_to_holiday(day: date, holiday_dates: list[date]) -> int | None:
    for holiday in holiday_dates:
        if holiday >= day:
            return (holiday - day).days
    return None
