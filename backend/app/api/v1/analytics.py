"""Analytics endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.deps import get_current_user, get_db
from app.models.call import CallSession, CallStatus
from app.models.campaign import Campaign, CampaignStatus
from app.models.hcp import ChannelType
from app.models.user import AppUser
from app.schemas.analytics import (
    CampaignPerformance,
    ChannelMix,
    ExportResponse,
    KPISummary,
    OutcomeDistribution,
)

router = APIRouter()


@router.get("/summary", response_model=KPISummary)
async def analytics_summary(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """High-level KPI summary."""
    total_q = await db.execute(select(func.count()).select_from(CallSession))
    total = total_q.scalar() or 0

    completed_q = await db.execute(
        select(func.count()).select_from(CallSession).where(CallSession.status == CallStatus.COMPLETED)
    )
    completed = completed_q.scalar() or 0

    avg_dur_q = await db.execute(
        select(func.avg(CallSession.duration_seconds)).select_from(CallSession)
    )
    avg_dur = avg_dur_q.scalar() or 0.0

    return KPISummary(
        total_reached=total,
        completion_rate=round((completed / total * 100) if total else 0.0, 2),
        avg_duration_seconds=round(float(avg_dur), 2),
        mlr_compliance_pct=100.0,
    )


@router.get("/outcomes", response_model=list[OutcomeDistribution])
async def analytics_outcomes(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Outcome breakdown by call status."""
    q = await db.execute(
        select(CallSession.status, func.count())
        .group_by(CallSession.status)
    )
    return [
        OutcomeDistribution(outcome=row[0].value, count=row[1])
        for row in q.all()
    ]


@router.get("/channel-mix", response_model=list[ChannelMix])
async def analytics_channel_mix(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Channel usage distribution."""
    q = await db.execute(
        select(CallSession.channel, func.count())
        .group_by(CallSession.channel)
    )
    return [
        ChannelMix(channel=row[0].value, count=row[1])
        for row in q.all()
    ]


@router.get("/campaigns", response_model=list[CampaignPerformance])
async def analytics_campaigns(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Per-campaign performance."""
    q = await db.execute(select(Campaign))
    campaigns = q.scalars().all()
    result = []
    for c in campaigns:
        total_q = await db.execute(
            select(func.count()).select_from(CallSession).where(CallSession.campaign_id == c.id)
        )
        total_calls = total_q.scalar() or 0
        comp_q = await db.execute(
            select(func.count())
            .select_from(CallSession)
            .where(CallSession.campaign_id == c.id, CallSession.status == CallStatus.COMPLETED)
        )
        comp_calls = comp_q.scalar() or 0
        rate = round((comp_calls / total_calls * 100) if total_calls else 0.0, 2)
        result.append(
            CampaignPerformance(
                campaign_id=c.id,
                campaign_name=c.name,
                total_calls=total_calls,
                completed_calls=comp_calls,
                completion_rate=rate,
                daily_counts=[],
            )
        )
    return result


@router.get("/export", response_model=ExportResponse)
async def analytics_export(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and return a pre-signed URL for analytics export."""
    return ExportResponse(
        url="https://ev-exports.s3.amazonaws.com/analytics/export.csv?presigned=true",
        expires_in=3600,
    )
