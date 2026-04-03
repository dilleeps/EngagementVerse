"""Pydantic v2 schemas for Lead / sales pipeline endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.lead import LeadSource, LeadStatus


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------

class LeadBase(BaseModel):
    """Fields shared by create / update / response."""

    model_config = ConfigDict(from_attributes=True)

    company_name: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    title: Optional[str] = None
    specialty: Optional[str] = None
    institution: Optional[str] = None
    state: Optional[str] = None
    lead_status: LeadStatus = LeadStatus.NEW
    lead_source: LeadSource = LeadSource.MANUAL
    hubspot_id: Optional[str] = None
    pipeline_stage: Optional[str] = None
    deal_value: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[Any] = None
    assigned_to: Optional[uuid.UUID] = None
    last_contacted_at: Optional[datetime] = None
    next_follow_up_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Create / Update
# ---------------------------------------------------------------------------

class LeadCreate(LeadBase):
    """Payload for POST /leads."""
    pass


class LeadUpdate(BaseModel):
    """Payload for PUT /leads/{id} — every field optional."""

    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    title: Optional[str] = None
    specialty: Optional[str] = None
    institution: Optional[str] = None
    state: Optional[str] = None
    lead_status: Optional[LeadStatus] = None
    lead_source: Optional[LeadSource] = None
    hubspot_id: Optional[str] = None
    pipeline_stage: Optional[str] = None
    deal_value: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[Any] = None
    assigned_to: Optional[uuid.UUID] = None
    last_contacted_at: Optional[datetime] = None
    next_follow_up_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class LeadResponse(LeadBase):
    """Single lead record returned from the API."""

    id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


class LeadListResponse(BaseModel):
    """Paginated list of leads."""

    model_config = ConfigDict(from_attributes=True)

    items: list[LeadResponse]
    total: int
    page: int
    size: int


# ---------------------------------------------------------------------------
# Import results
# ---------------------------------------------------------------------------

class LeadImportResult(BaseModel):
    """Summary of a bulk-import operation."""

    model_config = ConfigDict(from_attributes=True)

    imported: int
    skipped: int
    errors: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# HubSpot import request
# ---------------------------------------------------------------------------

class HubSpotImportRequest(BaseModel):
    """Body for POST /leads/hubspot-import."""

    api_key: str
    limit: Optional[int] = Field(default=100, ge=1, le=500)


# ---------------------------------------------------------------------------
# Stage update
# ---------------------------------------------------------------------------

class LeadStageUpdate(BaseModel):
    """Body for PUT /leads/{id}/stage."""

    lead_status: LeadStatus
