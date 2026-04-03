"""Tests for GET /api/v1/dashboard/summary."""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.models.call import CallSession


AUTH = {"Authorization": "Bearer test-token"}


@pytest.mark.asyncio
async def test_dashboard_summary_happy_path(client: AsyncClient, sample_call: CallSession):
    """Authenticated request returns all expected fields."""
    resp = await client.get("/api/v1/dashboard/summary", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert "active_calls_count" in body
    assert "hcps_reached_week" in body
    assert "completion_rate" in body
    assert "mlr_compliance_score" in body
    assert "recent_calls" in body
    assert isinstance(body["recent_calls"], list)
    assert "activity_feed" in body
    assert isinstance(body["activity_feed"], list)
    assert "call_volume_7d" in body
    assert isinstance(body["call_volume_7d"], list)


@pytest.mark.asyncio
async def test_dashboard_summary_unauthenticated():
    """Request without auth returns 401 or 403."""
    from app.main import app
    from app.infra.deps import get_current_user
    from httpx import ASGITransport, AsyncClient as AC

    saved = dict(app.dependency_overrides)
    app.dependency_overrides.pop(get_current_user, None)

    transport = ASGITransport(app=app)
    async with AC(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/dashboard/summary")
        # Without Bearer token, HTTPBearer dependency returns 403
        assert resp.status_code in (401, 403)

    app.dependency_overrides.update(saved)
