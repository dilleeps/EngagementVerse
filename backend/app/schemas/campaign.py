"""Pydantic v2 schemas for campaign endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.campaign import CampaignStatus, CommunicationType, MLRStatus
from app.models.hcp import ChannelType


# ---------------------------------------------------------------------------
# Campaign
# ---------------------------------------------------------------------------

class CampaignBase(BaseModel):
    """Shared fields for campaign create / update / response."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    drug_name: str
    communication_type: CommunicationType


class CampaignCreate(CampaignBase):
    """Payload for POST /campaigns."""

    scheduled_at: Optional[datetime] = None


class CampaignUpdate(BaseModel):
    """Payload for PATCH /campaigns/{id} – all optional."""

    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    drug_name: Optional[str] = None
    communication_type: Optional[CommunicationType] = None
    status: Optional[CampaignStatus] = None
    scheduled_at: Optional[datetime] = None


class CampaignResponse(CampaignBase):
    """Campaign record returned from the API."""

    id: uuid.UUID
    status: CampaignStatus
    mlr_script_version: Optional[str] = None
    mlr_approved_at: Optional[datetime] = None
    mlr_approved_by: Optional[uuid.UUID] = None
    created_by: uuid.UUID
    created_at: datetime
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Audience
# ---------------------------------------------------------------------------

class AudienceMember(BaseModel):
    """Single audience row for a campaign."""

    model_config = ConfigDict(from_attributes=True)

    hcp_id: uuid.UUID
    hcp_name: Optional[str] = None
    selected: bool = True
    priority_order: int = 0


class AudienceUpsert(BaseModel):
    """Payload for PUT /campaigns/{id}/audience."""

    model_config = ConfigDict(from_attributes=True)

    members: list[AudienceMember]


# ---------------------------------------------------------------------------
# MLR Script
# ---------------------------------------------------------------------------

class MLRScriptResponse(BaseModel):
    """Read-only MLR script record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    campaign_id: uuid.UUID
    version: str
    s3_key: str
    status: MLRStatus
    reviewed_by: Optional[uuid.UUID] = None
    reviewed_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# Campaign detail (includes audience, channels, MLR scripts)
# ---------------------------------------------------------------------------

class CampaignChannelResponse(BaseModel):
    """Read-only campaign channel record."""

    model_config = ConfigDict(from_attributes=True)

    campaign_id: uuid.UUID
    channel: ChannelType
    enabled: bool = True
    sequence_order: int = 0


class CampaignDetailResponse(CampaignResponse):
    """Extended campaign with nested audience, channels, and scripts."""

    audiences: list[AudienceMember] = Field(default_factory=list)
    channels: list[CampaignChannelResponse] = Field(default_factory=list)
    mlr_scripts: list[MLRScriptResponse] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Paginated list
# ---------------------------------------------------------------------------

class CampaignListResponse(BaseModel):
    """Paginated list of campaigns."""

    model_config = ConfigDict(from_attributes=True)

    items: list[CampaignResponse]
    total: int
    page: int
    size: int
