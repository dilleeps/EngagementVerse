"""Tests for /api/v1/calls endpoints."""

from __future__ import annotations

import uuid

import pytest
from httpx import AsyncClient

from app.models.call import CallSession, CallStatus
from app.models.hcp import HCP, ChannelType

AUTH = {"Authorization": "Bearer test-token"}


@pytest.mark.asyncio
async def test_list_calls_paginated(client: AsyncClient, sample_call: CallSession):
    """GET /api/v1/calls returns paginated results."""
    resp = await client.get("/api/v1/calls?page=1&size=10", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body
    assert "total" in body
    assert "page" in body
    assert "size" in body
    assert body["page"] == 1
    assert body["size"] == 10
    assert body["total"] >= 1
    assert len(body["items"]) >= 1


@pytest.mark.asyncio
async def test_get_call_queue(client: AsyncClient, db_session, sample_hcp: HCP, mock_users):
    """GET /api/v1/calls/queue returns only QUEUED calls."""
    queued_call = CallSession(
        id=uuid.uuid4(),
        hcp_id=sample_hcp.id,
        initiated_by=mock_users["MSL_LEAD"].id,
        status=CallStatus.QUEUED,
        channel=ChannelType.VOICE,
    )
    db_session.add(queued_call)
    await db_session.commit()

    resp = await client.get("/api/v1/calls/queue", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    for item in body:
        assert item["status"] == "QUEUED"


@pytest.mark.asyncio
async def test_get_call_by_id_happy(client: AsyncClient, sample_call: CallSession):
    """GET /api/v1/calls/{id} returns the call with transcripts and insights."""
    resp = await client.get(f"/api/v1/calls/{sample_call.id}", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == str(sample_call.id)
    assert "transcripts" in body
    assert "insights" in body


@pytest.mark.asyncio
async def test_get_call_by_id_404(client: AsyncClient):
    """GET /api/v1/calls/{id} for non-existent id returns 404."""
    fake_id = uuid.uuid4()
    resp = await client.get(f"/api/v1/calls/{fake_id}", headers=AUTH)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_escalate_call(client: AsyncClient, sample_call: CallSession, mock_users):
    """POST /api/v1/calls/{id}/escalate transitions status to ESCALATED."""
    target_user_id = str(mock_users["COMMERCIAL_OPS"].id)
    resp = await client.post(
        f"/api/v1/calls/{sample_call.id}/escalate",
        headers=AUTH,
        json={"escalate_to_user_id": target_user_id, "reason": "HCP requested specialist"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ESCALATED"


@pytest.mark.asyncio
async def test_end_call(client: AsyncClient, sample_call: CallSession):
    """POST /api/v1/calls/{id}/end transitions status to COMPLETED."""
    resp = await client.post(
        f"/api/v1/calls/{sample_call.id}/end",
        headers=AUTH,
        json={"outcome_notes": "Call completed successfully", "engagement_score": 0.85},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "COMPLETED"
    assert body["outcome_notes"] == "Call completed successfully"


@pytest.mark.asyncio
async def test_add_insight(client: AsyncClient, sample_call: CallSession):
    """POST /api/v1/calls/{id}/insights creates an AI insight."""
    resp = await client.post(
        f"/api/v1/calls/{sample_call.id}/insights",
        headers=AUTH,
        json={
            "call_id": str(sample_call.id),
            "insight_type": "UPSELL",
            "content": "HCP shows interest in new formulation",
            "confidence": 0.92,
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["insight_type"] == "UPSELL"
    assert body["content"] == "HCP shows interest in new formulation"
    assert body["confidence"] == 0.92
    assert "id" in body
    assert body["call_id"] == str(sample_call.id)
