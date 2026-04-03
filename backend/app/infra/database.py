"""Async SQLAlchemy engine and session factory."""

from __future__ import annotations

from functools import lru_cache

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings


@lru_cache()
def _get_engine():  # type: ignore[no-untyped-def]
    settings = get_settings()
    return create_async_engine(
        settings.DATABASE_URL,
        echo=(settings.ENVIRONMENT == "development"),
        pool_size=20,
        max_overflow=10,
    )


@lru_cache()
def _get_session_factory():  # type: ignore[no-untyped-def]
    return async_sessionmaker(
        _get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
    )


def get_engine():  # type: ignore[no-untyped-def]
    return _get_engine()


def async_session_factory() -> AsyncSession:
    """Return a new AsyncSession from the cached factory."""
    factory = _get_session_factory()
    return factory()
