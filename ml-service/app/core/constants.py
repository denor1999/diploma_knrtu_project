from datetime import date

REFERENCE_DATE = date(2026, 11, 2)

ALLOWED_AIRPORTS = frozenset({"SVO", "DME", "VKO", "AER", "KZN", "KGD", "LED"})

CITY_IATA = {
    "SVO": "MOW",
    "DME": "MOW",
    "VKO": "MOW",
    "AER": "AER",
    "KZN": "KZN",
    "KGD": "KGD",
    "LED": "LED",
}

SEED_ROUTES = (
    ("SVO", "AER", 1360, False),
    ("SVO", "KZN", 720, False),
    ("SVO", "KGD", 1090, False),
    ("SVO", "LED", 635, False),
)

FALLBACK_AIRPORTS = (
    {"iata": "SVO", "city": "Москва", "city_iata": "MOW", "timezone": "Europe/Moscow", "lat": 55.9726, "lon": 37.4146},
    {"iata": "DME", "city": "Москва", "city_iata": "MOW", "timezone": "Europe/Moscow", "lat": 55.4088, "lon": 37.9063},
    {"iata": "VKO", "city": "Москва", "city_iata": "MOW", "timezone": "Europe/Moscow", "lat": 55.5915, "lon": 37.2615},
    {"iata": "AER", "city": "Сочи", "city_iata": "AER", "timezone": "Europe/Moscow", "lat": 43.4499, "lon": 39.9566},
    {"iata": "KZN", "city": "Казань", "city_iata": "KZN", "timezone": "Europe/Moscow", "lat": 55.6062, "lon": 49.2787},
    {"iata": "KGD", "city": "Калининград", "city_iata": "KGD", "timezone": "Europe/Kaliningrad", "lat": 54.8899, "lon": 20.5926},
    {"iata": "LED", "city": "Санкт-Петербург", "city_iata": "LED", "timezone": "Europe/Moscow", "lat": 59.8003, "lon": 30.2625},
)

SOURCE_GROUPED = "aviasales_grouped_prices"
SOURCE_DATES = "aviasales_prices_for_dates"
SOURCE_SYNTHETIC = "synthetic"

MONTHS_GENITIVE = (
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
)
