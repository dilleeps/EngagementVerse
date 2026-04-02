"""Dashboard endpoints."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.deps import get_current_user, get_db
from app.models.call import CallSession, CallStatus
from app.models.hcp import HCP
from app.models.user import AppUser
from app.schemas.dashboard import (
    ActivityFeedItem,
    CallVolumeDay,
    DashboardSummary,
    RecentCall,
)
from app.services.mlr_service import get_compliance_score

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardSummary:
    """Return aggregated dashboard metrics."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    # Active (LIVE) calls
    active_q = await db.execute(
        select(func.count()).select_from(CallSession).where(
            CallSession.status == CallStatus.LIVE
        )
    )
    active_calls = active_q.scalar() or 0

    # HCPs reached this week (distinct hcp_id with COMPLETED calls in last 7 days)
    reached_q = await db.execute(
        select(func.count(func.distinct(CallSession.hcp_id))).where(
            CallSession.status == CallStatus.COMPLETED,
            CallSession.ended_at >= week_ago,
        )
    )
    hcps_reached = reached_q.scalar() or 0

    # Completion rate
    total_q = await db.execute(select(func.count()).select_from(CallSession))
    total_calls = total_q.scalar() or 0
    completed_q = await db.execute(
        select(func.count()).select_from(CallSession).where(
            CallSession.status == CallStatus.COMPLETED
        )
    )
    completed_calls = completed_q.scalar() or 0
    completion_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0.0

    # MLR compliance score
    mlr_score = await get_compliance_score(db)

    # Recent calls (last 10) with HCP names
    recent_q = await db.execute(
        select(CallSession, HCP.first_name, HCP.last_name)
        .join(HCP, CallSession.hcp_id == HCP.id)
        .order_by(CallSession.started_at.desc().nullslast())
        .limit(10)
    )
    recent_rows = recent_q.all()
    recent_calls = [
        RecentCall(
            id=row[0].id,
            hcp_name=f"{row[1]} {row[2]}",
            status=row[0].status.value,
            channel=row[0].channel.value,
            started_at=row[0].started_at,
            duration_seconds=row[0].duration_seconds,
            engagement_score=row[0].engagement_score,
        )
        for row in recent_rows
    ]

    # Activity feed (last 20 call events)
    feed_q = await db.execute(
        select(CallSession)
        .order_by(CallSession.started_at.desc().nullslast())
        .limit(20)
    )
    feed_rows = feed_q.scalars().all()
    activity_feed = [
        ActivityFeedItem(
            id=c.id,
            event_type=c.status.value,
            description=f"Call {c.status.value} via {c.channel.value}",
            actor=None,
            occurred_at=c.started_at or c.ended_at or now,
        )
        for c in feed_rows
    ]

    # 7-day call volume
    daily_volumes: list[CallVolumeDay] = []
    for day_offset in range(7):
        day_start = (week_ago + timedelta(days=day_offset)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        day_end = day_start + timedelta(days=1)
        day_q = await db.execute(
            select(func.count()).select_from(CallSession).where(
                CallSession.started_at >= day_start,
                CallSession.started_at < day_end,
            )
        )
        count = day_q.scalar() or 0
        daily_volumes.append(CallVolumeDay(date=day_start.date(), count=count))

    return DashboardSummary(
        active_calls_count=active_calls,
        hcps_reached_week=hcps_reached,
        completion_rate=round(completion_rate, 2),
        mlr_compliance_score=mlr_score,
        recent_calls=recent_calls,
        activity_feed=activity_feed,
        call_volume_7d=daily_volumes,
    )
