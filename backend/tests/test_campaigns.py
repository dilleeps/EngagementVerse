"""Tests for /api/v1/campaigns endpoints."""

from __future__ import annotations

import io
import uuid

import pytest
from httpx import AsyncClient

from app.models.campaign import Campaign, CampaignStatus
from app.models.hcp import HCP

AUTH = {"Authorization": "Bearer test-token"}


# ---------- CRUD ----------

@pytest.mark.asyncio
async def test_list_campaigns(client: AsyncClient, sample_campaign: Campaign):
    """GET /api/v1/campaigns returns a list."""
    resp = await client.get("/api/v1/campaigns", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1


@pytest.mark.asyncio
async def test_create_campaign(client: AsyncClient):
    """POST /api/v1/campaigns creates a new campaign."""
    resp = await client.post(
        "/api/v1/campaigns",
        headers=AUTH,
        json={
            "name": "New Campaign",
            "drug_name": "DrugX",
            "description": "Phase 3 outreach",
            "target_specialty": "ONCOLOGY",
            "budget": 50000.0,
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "New Campaign"
    assert body["drug_name"] == "DrugX"
    assert body["status"] == "DRAFT"
    assert "id" in body


@pytest.mark.asyncio
async def test_get_campaign_by_id(client: AsyncClient, sample_campaign: Campaign):
    """GET /api/v1/campaigns/{id} returns the campaign."""
    resp = await client.get(f"/api/v1/campaigns/{sample_campaign.id}", headers=AUTH)
    assert resp.status_code == 200
    assert resp.json()["id"] == str(sample_campaign.id)


@pytest.mark.asyncio
async def test_update_campaign(client: AsyncClient, sample_campaign: Campaign):
    """PUT /api/v1/campaigns/{id} updates fields."""
    resp = await client.put(
        f"/api/v1/campaigns/{sample_campaign.id}",
        headers=AUTH,
        json={"name": "Updated Name", "budget": 75000.0},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Updated Name"
    assert body["budget"] == 75000.0


# ---------- Launch / Pause ----------

@pytest.mark.asyncio
async def test_launch_campaign_valid_status(client: AsyncClient, db_session, mock_users):
    """POST launch succeeds when campaign is APPROVED."""
    campaign = Campaign(
        id=uuid.uuid4(),
        name="Approved Campaign",
        drug_name="DrugY",
        status=CampaignStatus.APPROVED,
        created_by=mock_users["MSL_LEAD"].id,
    )
    db_session.add(campaign)
    await db_session.commit()

    resp = await client.post(f"/api/v1/campaigns/{campaign.id}/launch", headers=AUTH)
    assert resp.status_code == 200
    assert resp.json()["status"] == "ACTIVE"


@pytest.mark.asyncio
async def test_launch_campaign_invalid_status(client: AsyncClient, sample_campaign: Campaign):
    """POST launch fails when campaign is DRAFT."""
    resp = await client.post(f"/api/v1/campaigns/{sample_campaign.id}/launch", headers=AUTH)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_pause_campaign(client: AsyncClient, db_session, mock_users):
    """POST pause transitions an active campaign to PAUSED."""
    campaign = Campaign(
        id=uuid.uuid4(),
        name="Active Campaign",
        drug_name="DrugZ",
        status=CampaignStatus.ACTIVE,
        created_by=mock_users["MSL_LEAD"].id,
    )
    db_session.add(campaign)
    await db_session.commit()

    resp = await client.post(f"/api/v1/campaigns/{campaign.id}/pause", headers=AUTH)
    assert resp.status_code == 200
    assert resp.json()["status"] == "PAUSED"


# ---------- Audience CRUD ----------

@pytest.mark.asyncio
async def test_audience_crud(client: AsyncClient, sample_campaign: Campaign, sample_hcp: HCP):
    """POST, GET, DELETE audience members."""
    # Add
    resp = await client.post(
        f"/api/v1/campaigns/{sample_campaign.id}/audience",
        headers=AUTH,
        json={"members": [{"hcp_id": str(sample_hcp.id), "priority": 1}]},
    )
    assert resp.status_code == 201
    members = resp.json()
    assert len(members) == 1
    member_id = members[0]["id"]

    # List
    resp = await client.get(
        f"/api/v1/campaigns/{sample_campaign.id}/audience", headers=AUTH
    )
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # Delete
    resp = await client.delete(
        f"/api/v1/campaigns/{sample_campaign.id}/audience/{member_id}",
        headers=AUTH,
    )
    assert resp.status_code == 204


# ---------- MLR Upload ----------

@pytest.mark.asyncio
async def test_mlr_upload(client: AsyncClient, sample_campaign: Campaign):
    """POST /api/v1/campaigns/{id}/mlr uploads an MLR script."""
    file_content = b"This is a test MLR script content."
    resp = await client.post(
        f"/api/v1/campaigns/{sample_campaign.id}/mlr?version=1.0",
        headers=AUTH,
        files={"file": ("test_script.txt", io.BytesIO(file_content), "text/plain")},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["version"] == "1.0"
    assert body["status"] == "DRAFT"
    assert "s3_key" in body
    assert body["campaign_id"] == str(sample_campaign.id)
