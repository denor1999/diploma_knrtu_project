"""initial analytics schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-11-19
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    json_type = postgresql.JSONB(astext_type=sa.Text())
    op.create_table(
        "dim_airports",
        sa.Column("iata", sa.String(length=8), primary_key=True),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("city_iata", sa.String(length=8), nullable=False),
        sa.Column("timezone", sa.String(length=64)),
        sa.Column("lat", sa.Float()),
        sa.Column("lon", sa.Float()),
    )
    op.create_table(
        "dim_routes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("origin", sa.String(length=8), sa.ForeignKey("dim_airports.iata"), nullable=False),
        sa.Column("dest", sa.String(length=8), sa.ForeignKey("dim_airports.iata"), nullable=False),
        sa.Column("distance_km", sa.Integer(), nullable=False),
        sa.Column("international", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.UniqueConstraint("origin", "dest", name="uq_dim_routes_origin_dest"),
    )
    op.create_table(
        "dim_calendar",
        sa.Column("date", sa.Date(), primary_key=True),
        sa.Column("weekday", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("is_weekend", sa.Boolean(), nullable=False),
        sa.Column("is_ru_holiday", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("days_to_holiday", sa.Integer()),
    )
    op.create_table(
        "price_observations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("origin", sa.String(length=8), nullable=False),
        sa.Column("dest", sa.String(length=8), nullable=False),
        sa.Column("departure_date", sa.Date(), nullable=False),
        sa.Column("return_date", sa.Date()),
        sa.Column("collected_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("collected_on", sa.Date(), nullable=False),
        sa.Column("price_rub", sa.Integer(), nullable=False),
        sa.Column("airline", sa.String(length=8)),
        sa.Column("transfers", sa.Integer()),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column("raw_json", json_type),
        sa.UniqueConstraint(
            "origin",
            "dest",
            "departure_date",
            "collected_on",
            "source",
            name="uq_price_obs_route_day_source",
        ),
    )
    op.create_table(
        "feature_rows",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("origin", sa.String(length=8), nullable=False),
        sa.Column("dest", sa.String(length=8), nullable=False),
        sa.Column("departure_date", sa.Date(), nullable=False),
        sa.Column("collected_on", sa.Date(), nullable=False),
        sa.Column("days_to_departure", sa.Integer(), nullable=False),
        sa.Column("current_price", sa.Integer(), nullable=False),
        sa.Column("lag_1", sa.Integer()),
        sa.Column("lag_7", sa.Integer()),
        sa.Column("lag_14", sa.Integer()),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("is_ru_holiday", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("days_to_holiday", sa.Integer()),
        sa.Column("unique_airlines_window", sa.Integer()),
        sa.Column("target_price_7d", sa.Integer()),
        sa.UniqueConstraint(
            "origin",
            "dest",
            "departure_date",
            "collected_on",
            name="uq_feature_rows_route_day",
        ),
    )
    op.create_table(
        "model_registry",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("version", sa.String(length=64), nullable=False, unique=True),
        sa.Column("path", sa.String(length=255), nullable=False),
        sa.Column("trained_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("metrics_json", json_type),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_table(
        "inference_log",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("origin", sa.String(length=8), nullable=False),
        sa.Column("dest", sa.String(length=8), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("predicted", sa.Integer(), nullable=False),
        sa.Column("rec", sa.String(length=16), nullable=False),
        sa.Column("model_version", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("inference_log")
    op.drop_table("model_registry")
    op.drop_table("feature_rows")
    op.drop_table("price_observations")
    op.drop_table("dim_calendar")
    op.drop_table("dim_routes")
    op.drop_table("dim_airports")
