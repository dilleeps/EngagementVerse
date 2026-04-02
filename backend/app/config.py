"""Application configuration via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration – values come from environment / .env file."""

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/engagementverse"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- AWS General ---
    AWS_ENDPOINT_URL: Optional[str] = None
    AWS_DEFAULT_REGION: str = "us-east-1"

    # --- Cognito ---
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    COGNITO_REGION: str = "us-east-1"

    # --- S3 Buckets ---
    S3_BUCKET_MLR_SCRIPTS: str = "engagementverse-mlr-scripts"
    S3_BUCKET_CALL_RECORDINGS: str = "engagementverse-call-recordings"
    S3_BUCKET_EXPORTS: str = "engagementverse-exports"
    S3_BUCKET_ASSETS: str = "engagementverse-assets"

    # --- SQS Queues ---
    SQS_URL_CALL_EVENTS: str = ""
    SQS_URL_CRM_SYNC: str = ""
    SQS_URL_ANALYTICS: str = ""

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
