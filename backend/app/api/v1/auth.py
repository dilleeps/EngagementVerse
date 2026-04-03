"""Auth endpoints for login, register, and token management."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.infra.deps import get_db
from app.models.user import AppUser, UserRole

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str = "MSL_LEAD"


class AuthResponse(BaseModel):
    user: dict
    tokens: dict


@router.post("/login")
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Authenticate user and return tokens.

    In development mode, accepts any password for existing users
    or the demo credentials.
    """
    result = await db.execute(
        select(AppUser).where(AppUser.email == body.email)
    )
    user = result.scalar_one_or_none()

    if settings.ENVIRONMENT == "development":
        if user is None:
            # Check demo credentials
            demo_users = {
                "admin@engagementverse.com": ("TempPass123", UserRole.MSL_LEAD),
                "msl@engagementverse.com": ("Demo1234", UserRole.MSL_LEAD),
                "medical@engagementverse.com": ("Demo1234", UserRole.MEDICAL_AFFAIRS),
            }
            if body.email in demo_users:
                expected_pw, role = demo_users[body.email]
                if body.password != expected_pw:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid email or password",
                    )
                # Auto-create demo user
                user = AppUser(
                    id=uuid.uuid4(),
                    cognito_sub=f"demo-{uuid.uuid4().hex[:8]}",
                    email=body.email,
                    full_name=body.email.split("@")[0].replace(".", " ").title(),
                    role=role,
                )
                db.add(user)
                await db.flush()
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )

        # Dev mode: generate a simple token (not real JWT)
        dev_token = f"ev-dev-{user.id}"
        return {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value if hasattr(user.role, "value") else user.role,
            },
            "tokens": {
                "access_token": dev_token,
                "refresh_token": f"ev-refresh-{user.id}",
            },
        }

    # Production: verify against Cognito
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Production Cognito auth not yet configured",
    )


@router.post("/register")
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Register a new user."""
    # Check if email already exists
    result = await db.execute(
        select(AppUser).where(AppUser.email == body.email)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Validate role
    try:
        role = UserRole(body.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid role: {body.role}",
        )

    user = AppUser(
        id=uuid.uuid4(),
        cognito_sub=f"local-{uuid.uuid4().hex[:12]}",
        email=body.email,
        full_name=f"{body.first_name} {body.last_name}",
        role=role,
    )
    db.add(user)
    await db.flush()

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value if hasattr(user.role, "value") else user.role,
        "message": "Account created successfully",
    }


@router.post("/callback")
async def auth_callback(body: dict):
    """Handle OAuth callback code exchange."""
    return {
        "access_token": f"ev-callback-{uuid.uuid4().hex[:16]}",
        "refresh_token": f"ev-refresh-{uuid.uuid4().hex[:16]}",
    }
