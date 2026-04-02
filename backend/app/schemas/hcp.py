"""Pydantic v2 schemas for HCP / prescribing behaviour endpoints."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.hcp import ChannelType, KOLTier, Specialty


# ---------------------------------------------------------------------------
# HCP
# ---------------------------------------------------------------------------

class HCPBase(BaseModel):
    """Fields shared by create / update / response."""

    model_config = ConfigDict(from_attributes=True)

    npi: str
    first_name: str
    last_name: str
    specialty: Specialty
    institution: Optional[str] = None
    state: Optional[str] = None
    kol_tier: KOLTier = KOLTier.NONE
    influence_score: Optional[float] = None
    engagement_score: Optional[float] = None
    preferred_channel: Optional[ChannelType] = None
    best_contact_time: Optional[str] = None
    publications_count: Optional[int] = 0
    citations_count: Optional[int] = 0
    tags: Optional[Any] = None


class HCPCreate(HCPBase):
    """Payload for POST /hcp."""
    pass


class HCPUpdate(BaseModel):
    """Payload for PATCH /hcp/{id} – every field optional."""

    model_config = ConfigDict(from_attributes=True)

    npi: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialty: Optional[Specialty] = None
    institution: Optional[str] = None
    state: Optional[str] = None
    kol_tier: Optional[KOLTier] = None
    influence_score: Optional[float] = None
    engagement_score: Optional[float] = None
    preferred_channel: Optional[ChannelType] = None
    best_contact_time: Optional[str] = None
    publications_count: Optional[int] = None
    citations_count: Optional[int] = None
    tags: Optional[Any] = None


class HCPResponse(HCPBase):
    """Single HCP record returned from the API."""

    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Prescribing Behaviour
# ---------------------------------------------------------------------------

class PrescribingBehaviorResponse(BaseModel):
    """Read-only representation of a prescribing-behaviour row."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    hcp_id: uuid.UUID
    drug_name: str
    monthly_volume: Optional[int] = None
    trend_pct: Optional[float] = None
    share_of_wallet_pct: Optional[float] = None
    recorded_month: Optional[date] = None


# ---------------------------------------------------------------------------
# HCP detail (includes prescribing list)
# ---------------------------------------------------------------------------

class HCPDetailResponse(HCPResponse):
    """Extended HCP record that includes prescribing behaviours."""

    prescribing_behaviors: list[PrescribingBehaviorResponse] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Paginated list
# ---------------------------------------------------------------------------

class HCPListResponse(BaseModel):
    """Paginated list of HCPs."""

    model_config = ConfigDict(from_attributes=True)

    items: list[HCPResponse]
    total: int
    page: int
    size: int


# ---------------------------------------------------------------------------
# Engagement event (timeline)
# ---------------------------------------------------------------------------

class EngagementEvent(BaseModel):
    """Represents a single engagement event on an HCP timeline."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_type: str
    channel: Optional[str] = None
    summary: str
    occurred_at: datetime
    engagement_score: Optional[float] = None
