"""Tests for /api/v1/analytics endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.models.call import CallSession

AUTH = {"Authorization": "Bearer test-token"}


@pytest.mark.asyncio
async def test_analytics_summary(client: AsyncClient, sample_call: CallSession):
    """GET /api/v1/analytics/summary returns KPIs."""
    resp = await client.get("/api/v1/analytics/summary", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert "total_reached" in body
    assert "completion_rate" in body
    assert "avg_duration_seconds" in body
    assert "mlr_compliance_pct" in body
    assert isinstance(body["total_reached"], int)
    assert isinstance(body["completion_rate"], float)


@pytest.mark.asyncio
async def test_analytics_outcomes(client: AsyncClient, sample_call: CallSession):
    """GET /api/v1/analytics/outcomes returns outcome distribution."""
    resp = await client.get("/api/v1/analytics/outcomes", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert "outcome" in body[0]
    assert "count" in body[0]


@pytest.mark.asyncio
async def test_analytics_channel_mix(client: AsyncClient, sample_call: CallSession):
    """GET /api/v1/analytics/channel-mix returns channel distribution."""
    resp = await client.get("/api/v1/analytics/channel-mix", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert "channel" in body[0]
    assert "count" in body[0]


@pytest.mark.asyncio
async def test_analytics_campaigns(client: AsyncClient, sample_campaign):
    """GET /api/v1/analytics/campaigns returns per-campaign stats."""
    resp = await client.get("/api/v1/analytics/campaigns", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert "campaign_id" in body[0]
    assert "campaign_name" in body[0]
    assert "total_calls" in body[0]
    assert "completed_calls" in body[0]
    assert "completion_rate" in body[0]


@pytest.mark.asyncio
async def test_analytics_export(client: AsyncClient):
    """GET /api/v1/analytics/export returns a download URL."""
    resp = await client.get("/api/v1/analytics/export", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert "url" in body
    assert "expires_in" in body
    assert body["expires_in"] == 3600
    assert body["url"].startswith("https://")
