from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = ""
    travelpayouts_token: str = ""
    ml_ingest_token: str = ""
    travelpayouts_base_url: str = "https://api.travelpayouts.com"
    data_dump_airports_url: str = "https://api.travelpayouts.com/data/ru/airports.json"
    isdayoff_url: str = "https://isdayoff.ru/api/getdata"


@lru_cache
def get_settings() -> Settings:
    return Settings()
