"""Tests for /api/v1/analytics endpoints."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from httpx import AsyncClient

from app.models.call import CallSession
from app.models.campaign import Campaign, CampaignStatus, CommunicationType

AUTH = {"Authorization": "Bearer test-token"}


@pytest.mark.asyncio
async def test_analytics_summary(client: AsyncClient, sample_call: CallSession):
    """GET /api/v1/analytics/summary returns the full summary payload."""
    resp = await client.get("/api/v1/analytics/summary", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert "total_calls" in body
    assert "total_hcps_reached" in body
    assert "avg_call_duration_seconds" in body
    assert "avg_engagement_score" in body
    assert "outcomes" in body
    assert "channel_mix" in body
    assert "campaign_performance" in body
    assert isinstance(body["total_calls"], int)


@pytest.mark.asyncio
async def test_analytics_outcomes(client: AsyncClient, sample_call: CallSession):
    """GET /api/v1/analytics/outcomes returns outcome distribution."""
    resp = await client.get("/api/v1/analytics/outcomes", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert "label" in body[0]
    assert "count" in body[0]
    assert "percentage" in body[0]


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
    assert "percentage" in body[0]


@pytest.mark.asyncio
async def test_analytics_campaigns(client: AsyncClient, db_session, mock_users, sample_call):
    """GET /api/v1/analytics/campaigns returns per-campaign stats."""
    # The service only returns ACTIVE or COMPLETED campaigns
    campaign = Campaign(
        name="Active Analytics",
        drug_name="DrugA",
        communication_type=CommunicationType.GENERAL,
        status=CampaignStatus.ACTIVE,
        created_by=mock_users["MSL_LEAD"].id,
    )
    db_session.add(campaign)
    await db_session.commit()

    resp = await client.get("/api/v1/analytics/campaigns", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert "campaign_id" in body[0]
    assert "campaign_name" in body[0]
    assert "total_calls" in body[0]
    assert "completion_rate" in body[0]


@pytest.mark.asyncio
@patch("app.services.analytics_service.boto3")
async def test_analytics_export(mock_boto3, client: AsyncClient):
    """GET /api/v1/analytics/export returns a download URL."""
    mock_s3 = MagicMock()
    mock_s3.generate_presigned_url.return_value = "https://ev-exports.s3.amazonaws.com/test.csv"
    mock_boto3.client.return_value = mock_s3

    resp = await client.get("/api/v1/analytics/export", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert "url" in body
