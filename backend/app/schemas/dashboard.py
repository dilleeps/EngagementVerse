"""Pydantic v2 schemas for the dashboard endpoint."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CallVolumeDay(BaseModel):
    """Single data-point for the 7-day call-volume sparkline."""

    model_config = ConfigDict(from_attributes=True)

    date: date
    count: int


class RecentCall(BaseModel):
    """Lightweight call record surfaced on the dashboard."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    hcp_name: str
    status: str
    channel: str
    started_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    engagement_score: Optional[float] = None


class ActivityFeedItem(BaseModel):
    """Single item in the live activity feed."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_type: str
    description: str
    actor: Optional[str] = None
    occurred_at: datetime


class DashboardSummary(BaseModel):
    """Aggregate dashboard payload returned by GET /api/v1/dashboard."""

    model_config = ConfigDict(from_attributes=True)

    active_calls_count: int
    hcps_reached_week: int
    completion_rate: float
    mlr_compliance_score: float
    recent_calls: list[RecentCall]
    activity_feed: list[ActivityFeedItem]
    call_volume_7d: list[CallVolumeDay]
