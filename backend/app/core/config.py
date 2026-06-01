"""Application configuration.

All runtime settings come from environment variables (12-factor style) so the
same image runs unchanged in dev, CI, and on Render. Parsing/validation is done
once at import time and cached, so a bad config fails fast on boot instead of
surfacing as a confusing error on the first request.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App ---
    PROJECT_NAME: str = "Orderly"
    API_V1_PREFIX: str = "/api/v1"

    # --- Database ---
    DATABASE_URL: str
    SQL_ECHO: bool = False

    # --- CORS ---
    # Accepts a comma-separated string from the env and normalises it to a list.
    # NoDecode disables pydantic-settings' default JSON parsing for this list
    # field, so "a,b,c" reaches our validator instead of failing a json.loads.
    BACKEND_CORS_ORIGINS: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    # --- Pagination defaults ---
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value):
        # Env vars arrive as strings; split "a,b,c" into a real list.
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("DATABASE_URL")
    @classmethod
    def _normalise_db_url(cls, value: str) -> str:
        # Managed providers (e.g. Render) hand out "postgres://" or "postgresql://"
        # URLs. Pin the psycopg2 driver so SQLAlchemy 2.0 accepts them unchanged.
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg2://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg2://", 1)
        return value


@lru_cache
def get_settings() -> Settings:
    # lru_cache makes this a singleton without a global mutable object.
    return Settings()


settings = get_settings()
