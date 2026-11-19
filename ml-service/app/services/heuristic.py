from dataclasses import dataclass
from datetime import date, timedelta
from math import sin

from app.api.schemas import Factor, PredictResponse, PricePoint
from app.core.constants import MONTHS_GENITIVE, REFERENCE_DATE

HEURISTIC_VERSION = "heuristic-v1"


@dataclass(frozen=True)
class Profile:
    current: int
    base: int
    low: int
    high: int
    delta_day: int
    factors: tuple[tuple[str, str, int], ...]


PROFILES: dict[str, Profile] = {
    "AER": Profile(
        8400,
        9000,
        8900,
        10600,
        -280,
        (
            ("Сезон поездки", "Спрос на южное направление", 900),
            ("Дни до вылета", "", 650),
            ("Конкуренция авиакомпаний", "Несколько прямых рейсов", -550),
            ("Текущий спрос", "Ниже среднего по маршруту", -300),
        ),
    ),
    "KZN": Profile(
        5200,
        5400,
        4500,
        5600,
        -100,
        (
            ("Сезон поездки", "Спокойный осенний спрос", -200),
            ("Дни до вылета", "", 150),
            ("Конкуренция авиакомпаний", "Прямые рейсы у нескольких перевозчиков", -350),
            ("Текущий спрос", "Ниже обычного уровня", -200),
        ),
    ),
    "KGD": Profile(
        6900,
        7200,
        6100,
        7400,
        120,
        (
            ("Сезон поездки", "Интерес к городу вырос умеренно", 250),
            ("Дни до вылета", "", 180),
            ("Конкуренция авиакомпаний", "Стыковки сдерживают тариф", -700),
            ("Текущий спрос", "Близок к среднему по маршруту", -180),
        ),
    ),
    "LED": Profile(
        4300,
        4600,
        3900,
        5100,
        -40,
        (
            ("Сезон поездки", "Направление летает часто", -150),
            ("Дни до вылета", "", 220),
            ("Конкуренция авиакомпаний", "Много рейсов в течение дня", -280),
            ("Текущий спрос", "Обычный уровень для ноября", -90),
        ),
    ),
}


def build_quote(origin: str, dest: str, departure: date) -> PredictResponse:
    profile = PROFILES.get(dest, PROFILES["AER"])
    days_left = max((departure - REFERENCE_DATE).days, 0)
    factors = [
        Factor(
            title=title,
            note=_days_note(days_left) if title == "Дни до вылета" else note,
            value=value,
        )
        for title, note, value in profile.factors
    ]
    expected = profile.base + sum(factor.value for factor in factors)
    rec = "buy" if expected > profile.current + 200 else "wait"
    return PredictResponse.model_validate(
        {
            "from": origin,
            "to": dest,
            "date": departure,
            "current": profile.current,
            "expected": expected,
            "low": profile.low,
            "high": profile.high,
            "base": profile.base,
            "deltaDay": profile.delta_day,
            "factors": factors,
            "rec": rec,
            "history": _history_series(profile.current, sum(map(ord, dest))),
            "forecast": _forecast_series(profile.current, expected),
            "updatedAt": _format_updated_at(REFERENCE_DATE),
            "horizonDate": REFERENCE_DATE + timedelta(days=7),
        }
    )


def _history_series(current: int, seed: int) -> list[PricePoint]:
    points: list[PricePoint] = []
    price = round(current * 1.22)
    for index in range(30, 0, -1):
        wave = sin((index + seed) / 2.4) * current * 0.035
        drift = ((30.0 - index) / 30.0) * (current - price)
        price = round(price + drift * 0.18 + wave * 0.15)
        points.append(PricePoint(date=REFERENCE_DATE - timedelta(days=index), price=max(1000, int(price))))
    points.append(PricePoint(date=REFERENCE_DATE, price=current))
    return points


def _forecast_series(current: int, expected: int) -> list[PricePoint]:
    points: list[PricePoint] = []
    for day in range(0, 8):
        t = day / 7.0
        eased = t * t * (3 - 2 * t)
        points.append(
            PricePoint(
                date=REFERENCE_DATE + timedelta(days=day),
                price=int(round(current + (expected - current) * eased)),
            )
        )
    return points


def _days_note(days_left: int) -> str:
    if days_left == 0:
        return "Вылет сегодня"
    return f"До поездки осталось {days_left} {_plural_days(days_left)}"


def _plural_days(count: int) -> str:
    mod10 = count % 10
    mod100 = count % 100
    if mod10 == 1 and mod100 != 11:
        return "день"
    if 2 <= mod10 <= 4 and (mod100 < 12 or mod100 > 14):
        return "дня"
    return "дней"


def _format_updated_at(value: date) -> str:
    return f"{value.day} {MONTHS_GENITIVE[value.month - 1]} {value.year} в 12:40 МСК"
