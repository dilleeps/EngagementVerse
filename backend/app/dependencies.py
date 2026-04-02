"""Shared FastAPI dependency functions."""

from __future__ import annotations

import uuid
from functools import lru_cache
from typing import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import Settings, get_settings
from app.models.user import AppUser

# ---------------------------------------------------------------------------
# Settings (cached singleton)
# ---------------------------------------------------------------------------

@lru_cache()
def get_settings_dep() -> Settings:
    """Return a cached Settings singleton usable as a FastAPI dependency."""
    return get_settings()


# ---------------------------------------------------------------------------
# Async database session
# ---------------------------------------------------------------------------

_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _init_engine(settings: Settings) -> None:
    global _engine, _session_factory
    if _engine is None:
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            pool_size=10,
            max_overflow=20,
        )
        _session_factory = async_sessionmaker(
            bind=_engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )


async def get_db(
    settings: Settings = Depends(get_settings_dep),
) -> AsyncGenerator[AsyncSession, None]:
    """Yield an async SQLAlchemy session, rolling back on error."""
    _init_engine(settings)
    assert _session_factory is not None
    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Redis
# ---------------------------------------------------------------------------

async def get_redis(request: Request) -> aioredis.Redis:
    """Return the application-wide Redis connection from the lifespan pool."""
    from app.main import redis_pool

    if redis_pool is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Redis not available",
        )
    return redis_pool


# ---------------------------------------------------------------------------
# Current user (JWT / dev mock)
# ---------------------------------------------------------------------------

# Cognito public-key fetch is skipped in dev; in prod you would cache JWKS.
_MOCK_USER_SUB = "dev-mock-cognito-sub-00000000"


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings_dep),
) -> AppUser:
    """Decode the ``Authorization: Bearer <token>`` JWT, look up the user.

    In *development* mode, if no Authorization header is provided a mock user
    is returned (or created on the fly).
    """
    auth_header: str | None = request.headers.get("Authorization")

    # --- Dev-mode shortcut ---
    if settings.ENVIRONMENT == "development" and not auth_header:
        return await _get_or_create_mock_user(db)

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.removeprefix("Bearer ").strip()

    try:
        # In production you would validate against Cognito JWKS.  For now we
        # accept the token without full signature verification so the codebase
        # stays self-contained.  Replace ``options`` with proper verification
        # once JWKS endpoint is wired.
        payload = jwt.decode(
            token,
            key="",  # placeholder – JWKS validation in prod
            algorithms=["RS256"],
            options={
                "verify_signature": False,
                "verify_aud": False,
                "verify_exp": True,
            },
        )
        cognito_sub: str | None = payload.get("sub")
        if cognito_sub is None:
            raise JWTError("Token missing 'sub' claim")
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    result = await db.execute(
        select(AppUser).where(AppUser.cognito_sub == cognito_sub)
    )
    user = result.scalars().first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found for this token",
        )
    return user


async def _get_or_create_mock_user(db: AsyncSession) -> AppUser:
    """Return (or lazily create) a deterministic dev-mode user."""
    result = await db.execute(
        select(AppUser).where(AppUser.cognito_sub == _MOCK_USER_SUB)
    )
    user = result.scalars().first()
    if user is not None:
        return user

    from app.models.user import UserRole

    user = AppUser(
        id=uuid.uuid4(),
        cognito_sub=_MOCK_USER_SUB,
        email="dev@engagementverse.local",
        full_name="Dev User",
        role=UserRole.MSL_LEAD,
    )
    db.add(user)
    await db.flush()
    return user
