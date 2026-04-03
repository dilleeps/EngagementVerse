"""Service layer for HCP profiles and prescribing behaviours."""

from __future__ import annotations

import json
import uuid
from typing import Any, Optional

import boto3
from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.models.call import CallSession
from app.models.hcp import HCP, KOLTier, PrescribingBehavior, Specialty
from app.schemas.hcp import (
    EngagementEvent,
    HCPCreate,
    HCPListResponse,
    HCPResponse,
    HCPUpdate,
)


async def search_hcps(
    db: AsyncSession,
    q: Optional[str] = None,
    specialty: Optional[Specialty] = None,
    kol_tier: Optional[KOLTier] = None,
    state: Optional[str] = None,
    page: int = 1,
    size: int = 20,
) -> HCPListResponse:
    """Search and paginate HCPs with optional filters."""
    stmt = select(HCP)

    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                HCP.first_name.ilike(pattern),
                HCP.last_name.ilike(pattern),
                HCP.npi.ilike(pattern),
                HCP.institution.ilike(pattern),
            )
        )
    if specialty:
        stmt = stmt.where(HCP.specialty == specialty)
    if kol_tier:
        stmt = stmt.where(HCP.kol_tier == kol_tier)
    if state:
        stmt = stmt.where(HCP.state == state)

    # Total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Paginated results
    offset = (page - 1) * size
    stmt = stmt.order_by(HCP.last_name, HCP.first_name).offset(offset).limit(size)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return HCPListResponse(
        items=[HCPResponse.model_validate(r) for r in rows],
        total=total,
        page=page,
        size=size,
    )


async def get_hcp(db: AsyncSession, hcp_id: uuid.UUID) -> HCP:
    """Return a single HCP or raise 404."""
    result = await db.execute(select(HCP).where(HCP.id == hcp_id))
    hcp = result.scalar_one_or_none()
    if hcp is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="HCP not found")
    return hcp


async def create_hcp(db: AsyncSession, data: HCPCreate) -> HCP:
    """Create a new HCP record."""
    hcp = HCP(**data.model_dump())
    db.add(hcp)
    await db.flush()
    await db.refresh(hcp)
    return hcp


async def update_hcp(db: AsyncSession, hcp_id: uuid.UUID, data: HCPUpdate) -> HCP:
    """Update an existing HCP record (partial update)."""
    hcp = await get_hcp(db, hcp_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hcp, field, value)
    await db.flush()
    await db.refresh(hcp)
    return hcp


async def get_prescribing(db: AsyncSession, hcp_id: uuid.UUID) -> list[PrescribingBehavior]:
    """Return prescribing behaviours for an HCP."""
    await get_hcp(db, hcp_id)
    result = await db.execute(
        select(PrescribingBehavior)
        .where(PrescribingBehavior.hcp_id == hcp_id)
        .order_by(PrescribingBehavior.recorded_month.desc())
    )
    return list(result.scalars().all())


async def get_engagement_timeline(db: AsyncSession, hcp_id: uuid.UUID) -> list[EngagementEvent]:
    """Return engagement events (calls) for an HCP sorted descending by start time."""
    await get_hcp(db, hcp_id)
    result = await db.execute(
        select(CallSession)
        .where(CallSession.hcp_id == hcp_id)
        .order_by(CallSession.started_at.desc().nullslast())
    )
    rows = result.scalars().all()
    return [
        EngagementEvent(
            id=r.id,
            event_type=r.status.value,
            channel=r.channel.value,
            summary=f"Call {r.status.value}",
            occurred_at=r.started_at or r.ended_at or r.crm_synced_at,
            engagement_score=r.engagement_score,
        )
        for r in rows
        if (r.started_at or r.ended_at or r.crm_synced_at) is not None
    ]


async def bulk_import_hcps(s3_key: str, settings: Settings) -> dict[str, Any]:
    """Enqueue a bulk-import job to SQS for background processing."""
    sqs_url = settings.SQS_CALL_DISPATCH_URL
    if not sqs_url:
        return {"message": "Bulk import enqueued (stub)", "s3_key": s3_key}

    client = boto3.client(
        "sqs",
        region_name=settings.AWS_DEFAULT_REGION,
        endpoint_url=settings.AWS_ENDPOINT_URL or None,
    )
    client.send_message(
        QueueUrl=sqs_url,
        MessageBody=json.dumps({"action": "bulk_import_hcps", "s3_key": s3_key}),
        MessageGroupId="hcp-import",
        MessageDeduplicationId=str(uuid.uuid4()),
    )
    return {"message": "Bulk import enqueued", "s3_key": s3_key}
