from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.constants import ALLOWED_AIRPORTS


class Factor(BaseModel):
    title: str
    note: str
    value: int


class PricePoint(BaseModel):
    date: date
    price: int


class PredictRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    origin: str = Field(alias="from", min_length=3, max_length=8)
    dest: str = Field(alias="to", min_length=3, max_length=8)
    date: date

    @field_validator("origin", "dest")
    @classmethod
    def normalize_iata(cls, value: str) -> str:
        code = value.strip().upper()
        if code not in ALLOWED_AIRPORTS:
            raise ValueError("Неизвестный аэропорт.")
        return code


class PredictResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int | None = None
    route_id: int | None = Field(default=None, alias="routeId")
    from_: str = Field(alias="from")
    to: str
    date: date
    current: int
    expected: int
    low: int
    high: int
    base: int
    delta_day: int = Field(alias="deltaDay")
    factors: list[Factor]
    rec: Literal["buy", "wait"]
    history: list[PricePoint]
    forecast: list[PricePoint]
    updated_at: str = Field(alias="updatedAt")
    horizon_date: date = Field(alias="horizonDate")
    created_at: datetime | None = Field(default=None, alias="createdAt")


class HealthResponse(BaseModel):
    status: str
    database: str
    model_version: str


class IngestRequest(BaseModel):
    source: Literal["auto", "synthetic", "live"] = "auto"


class IngestResponse(BaseModel):
    source: str
    airports: int
    routes: int
    calendar_days: int
    observations: int
