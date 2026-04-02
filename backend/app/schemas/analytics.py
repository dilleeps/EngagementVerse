"""Pydantic v2 schemas for analytics endpoints."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class OutcomeData(BaseModel):
    """Outcome breakdown for a given period."""

    model_config = ConfigDict(from_attributes=True)

    label: str
    count: int
    percentage: float


class ChannelMixData(BaseModel):
    """Channel distribution across calls."""

    model_config = ConfigDict(from_attributes=True)

    channel: str
    count: int
    percentage: float


class SparklinePoint(BaseModel):
    """Single point in a campaign-performance sparkline."""

    model_config = ConfigDict(from_attributes=True)

    date: date
    value: float


class CampaignPerformance(BaseModel):
    """Performance metrics for a single campaign."""

    model_config = ConfigDict(from_attributes=True)

    campaign_id: uuid.UUID
    campaign_name: str
    total_calls: int
    completion_rate: float
    avg_engagement_score: Optional[float] = None
    sparkline: list[SparklinePoint] = []


class AnalyticsSummary(BaseModel):
    """Top-level analytics payload returned by GET /api/v1/analytics."""

    model_config = ConfigDict(from_attributes=True)

    total_calls: int
    total_hcps_reached: int
    avg_call_duration_seconds: float
    avg_engagement_score: float
    outcomes: list[OutcomeData]
    channel_mix: list[ChannelMixData]
    campaign_performance: list[CampaignPerformance]


class ExportResponse(BaseModel):
    """Response for POST /api/v1/analytics/export."""

    model_config = ConfigDict(from_attributes=True)

    url: str
