"""Tests for /api/v1/hcp endpoints."""

from __future__ import annotations

import io
import uuid
from datetime import datetime, timezone

import pytest
from httpx import AsyncClient

from app.models.hcp import HCP, PrescribingBehavior, Specialty, KOLTier, ChannelType
from app.models.call import CallSession, CallStatus

AUTH = {"Authorization": "Bearer test-token"}


@pytest.mark.asyncio
async def test_search_hcps(client: AsyncClient, sample_hcp: HCP):
    """GET /api/v1/hcp?q=... filters by name or NPI."""
    # Search by last name
    resp = await client.get("/api/v1/hcp?q=Doe", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 1
    assert any(h["last_name"] == "Doe" for h in body["items"])

    # Search that returns nothing
    resp = await client.get("/api/v1/hcp?q=ZZZZZZZ", headers=AUTH)
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


@pytest.mark.asyncio
async def test_list_hcps_paginated(client: AsyncClient, sample_hcp: HCP):
    """GET /api/v1/hcp returns paginated results."""
    resp = await client.get("/api/v1/hcp?page=1&size=5", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert "items" in body
    assert "total" in body
    assert "page" in body
    assert body["page"] == 1
    assert body["size"] == 5


@pytest.mark.asyncio
async def test_create_hcp(client: AsyncClient):
    """POST /api/v1/hcp creates a new HCP."""
    resp = await client.post(
        "/api/v1/hcp",
        headers=AUTH,
        json={
            "npi": "9999999999",
            "first_name": "John",
            "last_name": "Smith",
            "specialty": "DERMATOLOGY",
            "institution": "Smith Clinic",
            "state": "CA",
            "kol_tier": "TIER_2",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["npi"] == "9999999999"
    assert body["first_name"] == "John"
    assert body["specialty"] == "DERMATOLOGY"
    assert "id" in body


@pytest.mark.asyncio
async def test_get_hcp_by_id(client: AsyncClient, sample_hcp: HCP):
    """GET /api/v1/hcp/{id} returns the HCP with prescribing behaviours."""
    resp = await client.get(f"/api/v1/hcp/{sample_hcp.id}", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == str(sample_hcp.id)
    assert "prescribing_behaviors" in body


@pytest.mark.asyncio
async def test_get_hcp_not_found(client: AsyncClient):
    """GET /api/v1/hcp/{id} returns 404 for non-existent id."""
    resp = await client.get(f"/api/v1/hcp/{uuid.uuid4()}", headers=AUTH)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_hcp(client: AsyncClient, sample_hcp: HCP):
    """PUT /api/v1/hcp/{id} updates fields."""
    resp = await client.put(
        f"/api/v1/hcp/{sample_hcp.id}",
        headers=AUTH,
        json={"institution": "Updated Hospital", "kol_tier": "TIER_3"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["institution"] == "Updated Hospital"
    assert body["kol_tier"] == "TIER_3"


@pytest.mark.asyncio
async def test_get_prescribing(client: AsyncClient, sample_hcp: HCP, db_session):
    """GET /api/v1/hcp/{id}/prescribing returns prescribing behaviours."""
    rx = PrescribingBehavior(
        id=uuid.uuid4(),
        hcp_id=sample_hcp.id,
        drug_name="DrugAlpha",
        monthly_volume=150,
        trend_pct=5.2,
    )
    db_session.add(rx)
    await db_session.commit()

    resp = await client.get(f"/api/v1/hcp/{sample_hcp.id}/prescribing", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert body[0]["drug_name"] == "DrugAlpha"


@pytest.mark.asyncio
async def test_get_engagement(client: AsyncClient, sample_call: CallSession, sample_hcp: HCP):
    """GET /api/v1/hcp/{id}/engagement returns engagement timeline."""
    resp = await client.get(f"/api/v1/hcp/{sample_hcp.id}/engagement", headers=AUTH)
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert "event_type" in body[0]
    assert "channel" in body[0]


@pytest.mark.asyncio
async def test_bulk_import(client: AsyncClient):
    """POST /api/v1/hcp/bulk-import accepts a file upload."""
    csv_content = b"npi,first_name,last_name,specialty\n1111111111,Bob,Jones,ONCOLOGY"
    resp = await client.post(
        "/api/v1/hcp/bulk-import",
        headers=AUTH,
        files={"file": ("hcps.csv", io.BytesIO(csv_content), "text/csv")},
    )
    assert resp.status_code == 202
    body = resp.json()
    assert "message" in body
    assert "s3_key" in body
