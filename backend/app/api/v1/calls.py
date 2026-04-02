"""Call session endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.deps import get_current_user, get_db
from app.models.call import CallStatus
from app.models.user import AppUser
from app.schemas.call import (
    AIInsightCreate,
    AIInsightResponse,
    CallDetailResponse,
    CallSessionResponse,
    EndCallRequest,
    EscalateRequest,
)
from app.services import call_service

router = APIRouter()


@router.get("", response_model=dict)
async def list_calls(
    status: Optional[CallStatus] = Query(None),
    campaign_id: Optional[uuid.UUID] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Paginated list of call sessions with filters."""
    return await call_service.get_calls(
        db,
        status_filter=status,
        campaign_id=campaign_id,
        date_from=date_from,
        date_to=date_to,
        page=page,
        size=size,
    )


@router.get("/queue", response_model=list[CallSessionResponse])
async def get_call_queue(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CallSessionResponse]:
    """Return calls in QUEUED status, ordered oldest first."""
    calls = await call_service.get_call_queue(db)
    return [CallSessionResponse.model_validate(c) for c in calls]


@router.get("/{call_id}", response_model=CallDetailResponse)
async def get_call(
    call_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CallDetailResponse:
    """Get a single call session with transcripts and insights."""
    call = await call_service.get_call(db, call_id)
    return CallDetailResponse.model_validate(call)


@router.post("/{call_id}/escalate", response_model=CallSessionResponse)
async def escalate_call(
    call_id: uuid.UUID,
    body: EscalateRequest,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CallSessionResponse:
    """Escalate a live call to a human agent."""
    call = await call_service.escalate_call(
        db, call_id, user_id=body.escalate_to_user_id, reason=body.reason
    )
    return CallSessionResponse.model_validate(call)


@router.post("/{call_id}/end", response_model=CallSessionResponse)
async def end_call(
    call_id: uuid.UUID,
    body: EndCallRequest,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CallSessionResponse:
    """End a call session."""
    call = await call_service.end_call(
        db, call_id, outcome_notes=body.outcome_notes, engagement_score=body.engagement_score
    )
    return CallSessionResponse.model_validate(call)


@router.post("/{call_id}/insights", response_model=AIInsightResponse, status_code=201)
async def add_insight(
    call_id: uuid.UUID,
    body: AIInsightCreate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AIInsightResponse:
    """Create an AI insight for a call."""
    insight = await call_service.add_insight(db, call_id, body)
    return AIInsightResponse.model_validate(insight)
