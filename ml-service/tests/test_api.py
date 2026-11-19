from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["model_version"] == "heuristic-v1"
    assert body["database"] in {"ok", "unavailable"}


def test_predict_svo_aer_schema() -> None:
    response = client.post("/v1/predict", json={"from": "SVO", "to": "AER", "date": "2026-11-24"})
    assert response.status_code == 200
    body = response.json()
    assert body["from"] == "SVO"
    assert body["to"] == "AER"
    assert body["date"] == "2026-11-24"
    assert body["expected"] == 9700
    assert body["rec"] == "buy"
    assert body["updatedAt"] == "2 ноября 2026 в 12:40 МСК"
    assert body["horizonDate"] == "2026-11-09"
    assert len(body["factors"]) == 4
    assert {factor["title"] for factor in body["factors"]} == {
        "Сезон поездки",
        "Дни до вылета",
        "Конкуренция авиакомпаний",
        "Текущий спрос",
    }
    assert len(body["history"]) == 31
    assert len(body["forecast"]) == 8


def test_predict_svo_led_wait() -> None:
    response = client.post("/v1/predict", json={"from": "SVO", "to": "LED", "date": "2026-11-24"})
    assert response.status_code == 200
    body = response.json()
    assert body["expected"] == 4300
    assert body["rec"] == "wait"


def test_predict_unknown_airport() -> None:
    response = client.post("/v1/predict", json={"from": "SVO", "to": "JFK", "date": "2026-11-24"})
    assert response.status_code == 422


def test_ingest_requires_token() -> None:
    response = client.post("/v1/ingest", json={"source": "synthetic"})
    assert response.status_code == 401
