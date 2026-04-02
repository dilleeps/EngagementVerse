"""Shared test fixtures – async SQLite in-memory DB, httpx AsyncClient, mock users."""

from __future__ import annotations

import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.base import Base
from app.models.user import AppUser, UserRole
from app.models.hcp import HCP, Specialty, KOLTier, ChannelType
from app.models.call import CallSession, CallStatus, Transcript, AIInsight, SpeakerType, InsightType
from app.models.campaign import Campaign, CampaignStatus, CampaignAudience, CampaignChannel, MLRScript, MLRStatus

# ---------------------------------------------------------------------------
# Async SQLite engine (aiosqlite)
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)

# SQLite does not enforce FK constraints by default; enable them.
@event.listens_for(engine.sync_engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

async_test_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# ---------------------------------------------------------------------------
# DB session fixture
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """Create all tables before each test and drop them after."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_test_session() as session:
        yield session


# ---------------------------------------------------------------------------
# Mock users (one per role)
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
async def mock_users(db_session: AsyncSession) -> dict[str, AppUser]:
    users: dict[str, AppUser] = {}
    for role in UserRole:
        user = AppUser(
            id=uuid.uuid4(),
            cognito_sub=f"sub-{role.value}-{uuid.uuid4().hex[:8]}",
            email=f"{role.value.lower()}@test.com",
            full_name=f"Test {role.value.replace('_', ' ').title()}",
            role=role,
        )
        db_session.add(user)
        users[role.value] = user
    await db_session.commit()
    for u in users.values():
        await db_session.refresh(u)
    return users


# ---------------------------------------------------------------------------
# Default "current user" for authenticated requests
# ---------------------------------------------------------------------------
_current_test_user: AppUser | None = None


def _override_get_current_user():
    """Return a FastAPI dependency override that yields the test user."""
    async def _inner():
        if _current_test_user is None:
            raise RuntimeError("No test user set")
        return _current_test_user
    return _inner


def _override_get_db():
    """Return a FastAPI dependency override that yields a test session."""
    async def _inner():
        async with async_test_session() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
    return _inner


# ---------------------------------------------------------------------------
# httpx AsyncClient fixture
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
async def client(mock_users: dict[str, AppUser]) -> AsyncGenerator[AsyncClient, None]:
    global _current_test_user
    # Default to MSL_LEAD user
    _current_test_user = mock_users["MSL_LEAD"]

    from app.main import app  # noqa: E402 (deferred import)
    from app.infra.deps import get_current_user, get_db

    app.dependency_overrides[get_current_user] = _override_get_current_user()
    app.dependency_overrides[get_db] = _override_get_db()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    _current_test_user = None


# ---------------------------------------------------------------------------
# Helper fixture: set active user role
# ---------------------------------------------------------------------------
@pytest.fixture
def set_current_user(mock_users: dict[str, AppUser]):
    """Call with a role name to switch the authenticated user."""
    def _set(role: str):
        global _current_test_user
        _current_test_user = mock_users[role]
    return _set


# ---------------------------------------------------------------------------
# Seed data helpers
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
async def sample_hcp(db_session: AsyncSession) -> HCP:
    hcp = HCP(
        id=uuid.uuid4(),
        npi="1234567890",
        first_name="Jane",
        last_name="Doe",
        specialty=Specialty.ONCOLOGY,
        institution="Test Hospital",
        state="NY",
        kol_tier=KOLTier.TIER_1,
        engagement_score=85.0,
    )
    db_session.add(hcp)
    await db_session.commit()
    await db_session.refresh(hcp)
    return hcp


@pytest_asyncio.fixture
async def sample_campaign(db_session: AsyncSession, mock_users: dict[str, AppUser]) -> Campaign:
    campaign = Campaign(
        id=uuid.uuid4(),
        name="Test Campaign",
        drug_name="TestDrug",
        status=CampaignStatus.DRAFT,
        created_by=mock_users["MSL_LEAD"].id,
    )
    db_session.add(campaign)
    await db_session.commit()
    await db_session.refresh(campaign)
    return campaign


@pytest_asyncio.fixture
async def sample_call(
    db_session: AsyncSession,
    sample_hcp: HCP,
    mock_users: dict[str, AppUser],
) -> CallSession:
    call = CallSession(
        id=uuid.uuid4(),
        hcp_id=sample_hcp.id,
        initiated_by=mock_users["MSL_LEAD"].id,
        status=CallStatus.LIVE,
        channel=ChannelType.VOICE,
        duration_seconds=120,
    )
    db_session.add(call)
    await db_session.commit()
    await db_session.refresh(call)
    return call
