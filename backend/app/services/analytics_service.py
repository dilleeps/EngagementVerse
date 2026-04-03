"""Service layer for analytics and KPI aggregation."""

from __future__ import annotations

import csv
import io
import json
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional

import boto3
from redis.asyncio import Redis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.call import CallSession, CallStatus
from app.models.campaign import Campaign, CampaignStatus, MLRScript, MLRStatus
from app.schemas.analytics import (
    AnalyticsSummary,
    CampaignPerformance,
    ChannelMixData,
    ExportResponse,
    OutcomeData,
    SparklinePoint,
)

CACHE_KEY = "analytics:summary"
CACHE_TTL = 300  # 5 minutes


async def get_summary(db: AsyncSession, redis: Redis) -> AnalyticsSummary:
    """Return cached analytics summary; recompute if cache is stale."""
    cached = await redis.get(CACHE_KEY)
    if cached:
        return AnalyticsSummary.model_validate_json(cached)

    # Total calls
    total_calls: int = (await db.execute(select(func.count(CallSession.id)))).scalar_one()

    # Total distinct HCPs reached
    total_hcps_reached: int = (
        await db.execute(
            select(func.count(func.distinct(CallSession.hcp_id))).where(
                CallSession.status == CallStatus.COMPLETED
            )
        )
    ).scalar_one()

    # Avg call duration (completed calls)
    avg_duration: float = (
        await db.execute(
            select(func.avg(CallSession.duration_seconds)).where(
                CallSession.status == CallStatus.COMPLETED
            )
        )
    ).scalar_one() or 0.0

    # Avg engagement score
    avg_engagement: float = (
        await db.execute(
            select(func.avg(CallSession.engagement_score)).where(
                CallSession.engagement_score.isnot(None)
            )
        )
    ).scalar_one() or 0.0

    outcomes = await get_outcomes(db)
    channel_mix = await get_channel_mix(db)
    campaign_perf = await get_campaign_performance(db)

    summary = AnalyticsSummary(
        total_calls=total_calls,
        total_hcps_reached=total_hcps_reached,
        avg_call_duration_seconds=round(float(avg_duration), 2),
        avg_engagement_score=round(float(avg_engagement), 2),
        outcomes=outcomes,
        channel_mix=channel_mix,
        campaign_performance=campaign_perf,
    )

    await redis.set(CACHE_KEY, summary.model_dump_json(), ex=CACHE_TTL)
    return summary


async def get_outcomes(db: AsyncSession) -> list[OutcomeData]:
    """Return call-status distribution with percentages."""
    stmt = select(CallSession.status, func.count(CallSession.id).label("cnt")).group_by(
        CallSession.status
    )
    result = await db.execute(stmt)
    rows = result.all()
    total = sum(r.cnt for r in rows) or 1
    return [
        OutcomeData(
            label=row.status.value,
            count=row.cnt,
            percentage=round(row.cnt / total * 100, 2),
        )
        for row in rows
    ]


async def get_channel_mix(db: AsyncSession) -> list[ChannelMixData]:
    """Return call-count per channel type with percentages."""
    stmt = select(CallSession.channel, func.count(CallSession.id).label("cnt")).group_by(
        CallSession.channel
    )
    result = await db.execute(stmt)
    rows = result.all()
    total = sum(r.cnt for r in rows) or 1
    return [
        ChannelMixData(
            channel=row.channel.value,
            count=row.cnt,
            percentage=round(row.cnt / total * 100, 2),
        )
        for row in rows
    ]


async def get_campaign_performance(db: AsyncSession) -> list[CampaignPerformance]:
    """Return per-campaign performance with a 7-day sparkline array."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    campaigns_result = await db.execute(
        select(Campaign).where(
            Campaign.status.in_([CampaignStatus.ACTIVE, CampaignStatus.COMPLETED])
        )
    )
    campaigns = campaigns_result.scalars().all()

    performance: list[CampaignPerformance] = []
    for c in campaigns:
        total: int = (
            await db.execute(
                select(func.count(CallSession.id)).where(CallSession.campaign_id == c.id)
            )
        ).scalar_one()

        completed: int = (
            await db.execute(
                select(func.count(CallSession.id)).where(
                    CallSession.campaign_id == c.id,
                    CallSession.status == CallStatus.COMPLETED,
                )
            )
        ).scalar_one()
        rate = (completed / total * 100) if total else 0.0

        avg_eng: float = (
            await db.execute(
                select(func.avg(CallSession.engagement_score)).where(
                    CallSession.campaign_id == c.id,
                    CallSession.engagement_score.isnot(None),
                )
            )
        ).scalar_one() or 0.0

        # Daily sparkline (last 7 days)
        sparkline: list[SparklinePoint] = []
        for day_offset in range(7):
            day_start = (week_ago + timedelta(days=day_offset)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            day_end = day_start + timedelta(days=1)
            day_count: int = (
                await db.execute(
                    select(func.count(CallSession.id)).where(
                        CallSession.campaign_id == c.id,
                        CallSession.started_at >= day_start,
                        CallSession.started_at < day_end,
                    )
                )
            ).scalar_one()
            sparkline.append(
                SparklinePoint(date=day_start.date(), value=float(day_count))
            )

        performance.append(
            CampaignPerformance(
                campaign_id=c.id,
                campaign_name=c.name,
                total_calls=total,
                completion_rate=round(rate, 2),
                avg_engagement_score=round(float(avg_eng), 2) if avg_eng else None,
                sparkline=sparkline,
            )
        )

    return performance


async def export_csv(db: AsyncSession, settings: Settings) -> ExportResponse:
    """Generate a CSV of all call sessions, upload to S3, return presigned URL."""
    result = await db.execute(
        select(CallSession).order_by(CallSession.started_at.desc().nullslast())
    )
    calls = result.scalars().all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "id", "hcp_id", "campaign_id", "status", "channel",
        "duration_seconds", "started_at", "ended_at", "outcome_notes",
        "engagement_score",
    ])
    for c in calls:
        writer.writerow([
            str(c.id),
            str(c.hcp_id),
            str(c.campaign_id) if c.campaign_id else "",
            c.status.value,
            c.channel.value,
            c.duration_seconds or "",
            c.started_at.isoformat() if c.started_at else "",
            c.ended_at.isoformat() if c.ended_at else "",
            c.outcome_notes or "",
            c.engagement_score or "",
        ])

    csv_bytes = buf.getvalue().encode("utf-8")
    key = f"exports/calls_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"

    s3 = boto3.client(
        "s3",
        region_name=settings.AWS_DEFAULT_REGION,
        endpoint_url=settings.AWS_ENDPOINT_URL or None,
    )
    s3.put_object(
        Bucket=settings.S3_EXPORTS_BUCKET,
        Key=key,
        Body=csv_bytes,
        ContentType="text/csv",
    )

    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_EXPORTS_BUCKET, "Key": key},
        ExpiresIn=3600,
    )
    return ExportResponse(url=url)
