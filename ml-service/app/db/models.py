from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    pass


JsonType = JSON().with_variant(JSONB, "postgresql")


class Airport(Base):
    __tablename__ = "dim_airports"

    iata: Mapped[str] = mapped_column(String(8), primary_key=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    city_iata: Mapped[str] = mapped_column(String(8), nullable=False)
    timezone: Mapped[str | None] = mapped_column(String(64))
    lat: Mapped[float | None] = mapped_column(Float)
    lon: Mapped[float | None] = mapped_column(Float)


class Route(Base):
    __tablename__ = "dim_routes"
    __table_args__ = (UniqueConstraint("origin", "dest", name="uq_dim_routes_origin_dest"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    origin: Mapped[str] = mapped_column(String(8), ForeignKey("dim_airports.iata"), nullable=False)
    dest: Mapped[str] = mapped_column(String(8), ForeignKey("dim_airports.iata"), nullable=False)
    distance_km: Mapped[int] = mapped_column(Integer, nullable=False)
    international: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class CalendarDay(Base):
    __tablename__ = "dim_calendar"

    date: Mapped[date] = mapped_column(Date, primary_key=True)
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    is_weekend: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_ru_holiday: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    days_to_holiday: Mapped[int | None] = mapped_column(Integer)


class PriceObservation(Base):
    __tablename__ = "price_observations"
    __table_args__ = (
        UniqueConstraint(
            "origin",
            "dest",
            "departure_date",
            "collected_on",
            "source",
            name="uq_price_obs_route_day_source",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    origin: Mapped[str] = mapped_column(String(8), nullable=False)
    dest: Mapped[str] = mapped_column(String(8), nullable=False)
    departure_date: Mapped[date] = mapped_column(Date, nullable=False)
    return_date: Mapped[date | None] = mapped_column(Date)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    collected_on: Mapped[date] = mapped_column(Date, nullable=False)
    price_rub: Mapped[int] = mapped_column(Integer, nullable=False)
    airline: Mapped[str | None] = mapped_column(String(8))
    transfers: Mapped[int | None] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    raw_json: Mapped[dict | None] = mapped_column(JsonType)


class FeatureRow(Base):
    __tablename__ = "feature_rows"
    __table_args__ = (
        UniqueConstraint(
            "origin",
            "dest",
            "departure_date",
            "collected_on",
            name="uq_feature_rows_route_day",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    origin: Mapped[str] = mapped_column(String(8), nullable=False)
    dest: Mapped[str] = mapped_column(String(8), nullable=False)
    departure_date: Mapped[date] = mapped_column(Date, nullable=False)
    collected_on: Mapped[date] = mapped_column(Date, nullable=False)
    days_to_departure: Mapped[int] = mapped_column(Integer, nullable=False)
    current_price: Mapped[int] = mapped_column(Integer, nullable=False)
    lag_1: Mapped[int | None] = mapped_column(Integer)
    lag_7: Mapped[int | None] = mapped_column(Integer)
    lag_14: Mapped[int | None] = mapped_column(Integer)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    is_ru_holiday: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    days_to_holiday: Mapped[int | None] = mapped_column(Integer)
    unique_airlines_window: Mapped[int | None] = mapped_column(Integer)
    target_price_7d: Mapped[int | None] = mapped_column(Integer)


class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    version: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    path: Mapped[str] = mapped_column(String(255), nullable=False)
    trained_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    metrics_json: Mapped[dict | None] = mapped_column(JsonType)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class InferenceLog(Base):
    __tablename__ = "inference_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    origin: Mapped[str] = mapped_column(String(8), nullable=False)
    dest: Mapped[str] = mapped_column(String(8), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    predicted: Mapped[int] = mapped_column(Integer, nullable=False)
    rec: Mapped[str] = mapped_column(String(16), nullable=False)
    model_version: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
