"""FastAPI dependency providers."""

from __future__ import annotations

from typing import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.infra.database import async_session_factory
from app.models.user import AppUser

security = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_redis(
    settings: Settings = Depends(get_settings),
) -> AsyncGenerator[aioredis.Redis, None]:
    """Yield a Redis connection."""
    r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        yield r
    finally:
        await r.aclose()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AppUser:
    """Decode JWT and return the AppUser.

    In development mode with an empty Cognito config, we return the first user
    in the database so that endpoints remain testable without Cognito running.
    """
    from sqlalchemy import select

    token = credentials.credentials  # noqa: F841

    # --- DEV shortcut: skip real Cognito verification ---
    if settings.ENVIRONMENT == "development":
        result = await db.execute(select(AppUser).limit(1))
        user = result.scalar_one_or_none()
        if user is None:
            # Auto-create a dev user if none exists
            from app.models.user import UserRole
            import uuid
            dev_user = AppUser(
                id=uuid.uuid4(),
                cognito_sub="dev-user",
                email="admin@engagementverse.com",
                full_name="Dev Admin",
                role=UserRole.MSL_LEAD,
            )
            db.add(dev_user)
            await db.flush()
            return dev_user
        return user

    # --- Production path (Cognito JWT verification) ---
    # In a real deployment this would verify the JWT against the Cognito JWKS,
    # extract the `sub` claim, and look up the corresponding AppUser row.
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Cognito token verification not configured",
    )
