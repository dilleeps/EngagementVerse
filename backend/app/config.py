"""Application configuration via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration – values come from environment / .env file."""

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://ev_admin:EvDbPass2026Secure@ev-postgres.c4jkok8wwflz.us-east-1.rds.amazonaws.com:5432/ev_db"

    # --- Redis ---
    REDIS_URL: str = "redis://ev-redis.roqmrh.0001.use1.cache.amazonaws.com:6379/0"

    # --- AWS General ---
    AWS_ENDPOINT_URL: Optional[str] = None
    AWS_DEFAULT_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None

    # --- Cognito ---
    COGNITO_USER_POOL_ID: str = "us-east-1_Pj6WH6gva"
    COGNITO_CLIENT_ID: str = "3ga8tui048sf7envfgii1j42e2"
    COGNITO_REGION: str = "us-east-1"

    # --- S3 Buckets ---
    S3_RECORDINGS_BUCKET: str = "ev-call-recordings-624057415275"
    S3_MLR_BUCKET: str = "ev-mlr-scripts-624057415275"
    S3_EXPORTS_BUCKET: str = "ev-exports-624057415275"
    S3_IMPORTS_BUCKET: str = "ev-hcp-imports-624057415275"

    # --- SQS Queues ---
    SQS_CALL_DISPATCH_URL: str = "https://queue.amazonaws.com/624057415275/ev-call-dispatch.fifo"
    SQS_CRM_SYNC_URL: str = "https://queue.amazonaws.com/624057415275/ev-crm-sync.fifo"
    SQS_FOLLOW_UP_URL: str = "https://queue.amazonaws.com/624057415275/ev-follow-up-tasks"

    # --- Amazon Connect ---
    CONNECT_INSTANCE_ID: str = ""

    # --- Runtime ---
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
