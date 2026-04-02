"""Pydantic v2 schemas for call session endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.call import CallStatus, InsightType, SpeakerType
from app.models.hcp import ChannelType


# ---------------------------------------------------------------------------
# Call session
# ---------------------------------------------------------------------------

class CallSessionBase(BaseModel):
    """Shared fields for call creation / response."""

    model_config = ConfigDict(from_attributes=True)

    hcp_id: uuid.UUID
    campaign_id: Optional[uuid.UUID] = None
    channel: ChannelType


class CallSessionCreate(CallSessionBase):
    """Payload for POST /calls."""
    pass


class CallSessionResponse(CallSessionBase):
    """Full call-session record returned from the API."""

    id: uuid.UUID
    initiated_by: uuid.UUID
    status: CallStatus
    duration_seconds: Optional[int] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    connect_contact_id: Optional[str] = None
    escalated_to_user_id: Optional[uuid.UUID] = None
    escalation_reason: Optional[str] = None
    crm_synced_at: Optional[datetime] = None
    crm_record_id: Optional[str] = None
    outcome_notes: Optional[str] = None
    engagement_score: Optional[float] = None


# ---------------------------------------------------------------------------
# Transcript
# ---------------------------------------------------------------------------

class TranscriptLine(BaseModel):
    """Single transcript entry."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    call_id: uuid.UUID
    speaker: SpeakerType
    text: str
    timestamp_offset_ms: Optional[int] = None
    confidence_score: Optional[float] = None


# ---------------------------------------------------------------------------
# AI Insight
# ---------------------------------------------------------------------------

class AIInsightCreate(BaseModel):
    """Payload for creating an AI insight attached to a call."""

    model_config = ConfigDict(from_attributes=True)

    call_id: uuid.UUID
    insight_type: InsightType
    content: str
    confidence: Optional[float] = None


class AIInsightResponse(AIInsightCreate):
    """AI insight record returned from the API."""

    id: uuid.UUID
    created_at: datetime


# ---------------------------------------------------------------------------
# Call detail (includes transcripts + insights)
# ---------------------------------------------------------------------------

class CallDetailResponse(CallSessionResponse):
    """Extended call record including nested transcripts and insights."""

    transcripts: list[TranscriptLine] = Field(default_factory=list)
    insights: list[AIInsightResponse] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Queue / actions
# ---------------------------------------------------------------------------

class CallQueueItem(BaseModel):
    """Item shown in the call queue sidebar."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    hcp_id: uuid.UUID
    hcp_name: str
    specialty: Optional[str] = None
    channel: ChannelType
    status: CallStatus
    priority: int = 0
    scheduled_at: Optional[datetime] = None


class EscalateRequest(BaseModel):
    """Payload for POST /calls/{id}/escalate."""

    model_config = ConfigDict(from_attributes=True)

    escalate_to_user_id: uuid.UUID
    reason: str


class EndCallRequest(BaseModel):
    """Payload for POST /calls/{id}/end."""

    model_config = ConfigDict(from_attributes=True)

    outcome_notes: Optional[str] = None
    engagement_score: Optional[float] = None
