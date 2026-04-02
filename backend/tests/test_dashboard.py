"""Tests for GET /api/v1/dashboard/summary."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_summary_happy_path(client: AsyncClient):
    """Authenticated request returns all expected fields."""
    resp = await client.get(
        "/api/v1/dashboard/summary",
        headers={"Authorization": "Bearer test-token"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "active_calls" in body
    assert "hcps_reached_this_week" in body
    assert "completion_rate" in body
    assert "mlr_compliance_score" in body
    assert "recent_calls" in body
    assert isinstance(body["recent_calls"], list)
    assert "activity_feed" in body
    assert isinstance(body["activity_feed"], list)
    assert "daily_volumes" in body
    assert isinstance(body["daily_volumes"], list)


@pytest.mark.asyncio
async def test_dashboard_summary_unauthenticated():
    """Request without auth returns 401 (or 403)."""
    from app.main import app
    from app.infra.deps import get_current_user, get_db
    from httpx import ASGITransport, AsyncClient as AC
    from fastapi import HTTPException

    # Remove overrides so real auth kicks in
    saved = dict(app.dependency_overrides)
    app.dependency_overrides.pop(get_current_user, None)

    transport = ASGITransport(app=app)
    async with AC(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/dashboard/summary")
        # Without Bearer token, HTTPBearer dependency returns 403
        assert resp.status_code in (401, 403)

    # Restore
    app.dependency_overrides.update(saved)
