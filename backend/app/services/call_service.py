"""Service layer for call sessions, transcripts, and AI insights."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from redis.asyncio import Redis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.call import AIInsight, CallSession, CallStatus, SpeakerType, Transcript
from app.models.hcp import ChannelType
from app.models.user import AppUser
from app.schemas.call import (
    AIInsightCreate,
    CallSessionResponse,
)


async def get_calls(
    db: AsyncSession,
    status_filter: Optional[CallStatus] = None,
    campaign_id: Optional[uuid.UUID] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    page: int = 1,
    size: int = 20,
) -> dict:
    """Return a paginated, filtered list of call sessions."""
    stmt = select(CallSession)

    if status_filter:
        stmt = stmt.where(CallSession.status == status_filter)
    if campaign_id:
        stmt = stmt.where(CallSession.campaign_id == campaign_id)
    if date_from:
        stmt = stmt.where(CallSession.started_at >= date_from)
    if date_to:
        stmt = stmt.where(CallSession.started_at <= date_to)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    offset = (page - 1) * size
    stmt = stmt.order_by(CallSession.started_at.desc().nullslast()).offset(offset).limit(size)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return {
        "items": [CallSessionResponse.model_validate(r) for r in rows],
        "total": total,
        "page": page,
        "size": size,
    }


async def get_call(db: AsyncSession, call_id: uuid.UUID) -> CallSession:
    """Return a single call session with transcripts and insights, or 404."""
    result = await db.execute(
        select(CallSession)
        .options(selectinload(CallSession.transcripts), selectinload(CallSession.insights))
        .where(CallSession.id == call_id)
    )
    call = result.scalar_one_or_none()
    if call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call session not found")
    return call


async def get_call_queue(db: AsyncSession) -> list[CallSession]:
    """Return ordered pending call queue (QUEUED status, oldest first)."""
    result = await db.execute(
        select(CallSession)
        .where(CallSession.status == CallStatus.QUEUED)
        .order_by(CallSession.started_at.asc().nullslast())
    )
    return list(result.scalars().all())


async def initiate_call(
    db: AsyncSession,
    hcp_id: uuid.UUID,
    campaign_id: Optional[uuid.UUID],
    user: AppUser,
    channel: ChannelType = ChannelType.VOICE,
) -> CallSession:
    """Create a new QUEUED call session.

    In production this would also invoke Amazon Connect to start the outbound call.
    """
    call = CallSession(
        hcp_id=hcp_id,
        campaign_id=campaign_id,
        initiated_by=user.id,
        status=CallStatus.QUEUED,
        channel=channel,
        started_at=datetime.now(timezone.utc),
    )
    db.add(call)
    await db.flush()
    await db.refresh(call)
    return call


async def escalate_call(
    db: AsyncSession,
    call_id: uuid.UUID,
    user_id: uuid.UUID,
    reason: str,
) -> CallSession:
    """Escalate a call to a human agent."""
    call = await get_call(db, call_id)
    if call.status == CallStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot escalate a completed call",
        )
    call.status = CallStatus.ESCALATED
    call.escalated_to_user_id = user_id
    call.escalation_reason = reason
    await db.flush()
    await db.refresh(call)
    return call


async def end_call(
    db: AsyncSession,
    call_id: uuid.UUID,
    outcome_notes: Optional[str] = None,
    engagement_score: Optional[float] = None,
) -> CallSession:
    """Complete a call, computing its duration."""
    call = await get_call(db, call_id)
    if call.status == CallStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call is already completed",
        )
    now = datetime.now(timezone.utc)
    call.status = CallStatus.COMPLETED
    call.ended_at = now
    if call.started_at:
        delta = now - call.started_at
        call.duration_seconds = int(delta.total_seconds())
    call.outcome_notes = outcome_notes
    if engagement_score is not None:
        call.engagement_score = engagement_score
    await db.flush()
    await db.refresh(call)
    return call


async def add_insight(
    db: AsyncSession,
    call_id: uuid.UUID,
    insight_data: AIInsightCreate,
) -> AIInsight:
    """Create a new AI insight for a call."""
    await get_call(db, call_id)
    insight = AIInsight(
        call_id=call_id,
        insight_type=insight_data.insight_type,
        content=insight_data.content,
        confidence=insight_data.confidence,
    )
    db.add(insight)
    await db.flush()
    await db.refresh(insight)
    return insight


async def store_transcript_line(
    db: AsyncSession,
    redis: Redis,
    call_id: uuid.UUID,
    speaker: SpeakerType,
    text: str,
    offset_ms: Optional[int] = None,
    confidence: Optional[float] = None,
) -> Transcript:
    """Persist a transcript line and publish it to Redis for live streaming."""
    transcript = Transcript(
        call_id=call_id,
        speaker=speaker,
        text=text,
        timestamp_offset_ms=offset_ms,
        confidence_score=confidence,
    )
    db.add(transcript)
    await db.flush()
    await db.refresh(transcript)

    # Publish to Redis pub/sub for WebSocket consumers
    channel = f"call:{call_id}:transcript"
    payload = json.dumps(
        {
            "id": str(transcript.id),
            "call_id": str(call_id),
            "speaker": speaker.value,
            "text": text,
            "timestamp_offset_ms": offset_ms,
            "confidence_score": confidence,
        }
    )
    await redis.publish(channel, payload)
    return transcript
