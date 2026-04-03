"""Analytics endpoints."""

from __future__ import annotations

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.infra.deps import get_current_user, get_db, get_redis
from app.models.user import AppUser
from app.schemas.analytics import (
    AnalyticsSummary,
    CampaignPerformance,
    ChannelMixData,
    ExportResponse,
    OutcomeData,
)
from app.services import analytics_service

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def analytics_summary(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> AnalyticsSummary:
    """Full analytics summary with caching."""
    return await analytics_service.get_summary(db, redis)


@router.get("/outcomes", response_model=list[OutcomeData])
async def analytics_outcomes(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[OutcomeData]:
    """Outcome breakdown by call status."""
    return await analytics_service.get_outcomes(db)


@router.get("/channel-mix", response_model=list[ChannelMixData])
async def analytics_channel_mix(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ChannelMixData]:
    """Channel usage distribution."""
    return await analytics_service.get_channel_mix(db)


@router.get("/campaigns", response_model=list[CampaignPerformance])
async def analytics_campaigns(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CampaignPerformance]:
    """Per-campaign performance with sparklines."""
    return await analytics_service.get_campaign_performance(db)


@router.get("/export", response_model=ExportResponse)
async def analytics_export(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> ExportResponse:
    """Generate a CSV export and return a presigned S3 URL."""
    return await analytics_service.export_csv(db, settings)
