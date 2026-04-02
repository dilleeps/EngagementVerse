"""Service layer for campaigns, audiences, and MLR scripts."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.campaign import (
    Campaign,
    CampaignAudience,
    CampaignStatus,
    MLRScript,
    MLRStatus,
)
from app.models.user import AppUser
from app.schemas.campaign import (
    AudienceMember,
    CampaignCreate,
    CampaignUpdate,
)


# ---------- Campaign CRUD ----------


async def list_campaigns(
    db: AsyncSession,
    status_filter: Optional[CampaignStatus] = None,
    drug_name: Optional[str] = None,
) -> list[Campaign]:
    """Return all campaigns matching optional filters."""
    stmt = select(Campaign)
    if status_filter:
        stmt = stmt.where(Campaign.status == status_filter)
    if drug_name:
        stmt = stmt.where(Campaign.drug_name.ilike(f"%{drug_name}%"))
    stmt = stmt.order_by(Campaign.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_campaign(db: AsyncSession, campaign_id: uuid.UUID) -> Campaign:
    """Return a single campaign or 404."""
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if campaign is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


async def create_campaign(
    db: AsyncSession,
    data: CampaignCreate,
    user: AppUser,
) -> Campaign:
    """Create a new campaign in DRAFT status."""
    campaign = Campaign(
        name=data.name,
        drug_name=data.drug_name,
        communication_type=data.communication_type,
        scheduled_at=data.scheduled_at,
        created_by=user.id,
        status=CampaignStatus.DRAFT,
    )
    db.add(campaign)
    await db.flush()
    await db.refresh(campaign)
    return campaign


async def update_campaign(
    db: AsyncSession,
    campaign_id: uuid.UUID,
    data: CampaignUpdate,
) -> Campaign:
    """Partially update a campaign."""
    campaign = await get_campaign(db, campaign_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    await db.flush()
    await db.refresh(campaign)
    return campaign


# ---------- Campaign lifecycle ----------


async def launch_campaign(db: AsyncSession, campaign_id: uuid.UUID) -> Campaign:
    """Transition campaign from APPROVED to ACTIVE."""
    campaign = await get_campaign(db, campaign_id)
    if campaign.status != CampaignStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campaign must be APPROVED to launch (current: {campaign.status.value})",
        )
    campaign.status = CampaignStatus.ACTIVE
    await db.flush()
    await db.refresh(campaign)
    return campaign


async def pause_campaign(db: AsyncSession, campaign_id: uuid.UUID) -> Campaign:
    """Pause an ACTIVE campaign."""
    campaign = await get_campaign(db, campaign_id)
    if campaign.status != CampaignStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campaign must be ACTIVE to pause (current: {campaign.status.value})",
        )
    campaign.status = CampaignStatus.PAUSED
    await db.flush()
    await db.refresh(campaign)
    return campaign


# ---------- Audience ----------


async def get_audience(db: AsyncSession, campaign_id: uuid.UUID) -> list[CampaignAudience]:
    """Return audience members for a campaign."""
    await get_campaign(db, campaign_id)
    result = await db.execute(
        select(CampaignAudience)
        .where(CampaignAudience.campaign_id == campaign_id)
        .order_by(CampaignAudience.priority_order.desc())
    )
    return list(result.scalars().all())


async def upsert_audience(
    db: AsyncSession,
    campaign_id: uuid.UUID,
    members: list[AudienceMember],
) -> list[CampaignAudience]:
    """Bulk upsert audience members for a campaign.

    For each incoming member, if a row with the same (campaign_id, hcp_id) already
    exists, update its fields; otherwise insert a new row.
    """
    await get_campaign(db, campaign_id)

    existing_result = await db.execute(
        select(CampaignAudience).where(CampaignAudience.campaign_id == campaign_id)
    )
    existing_map: dict[uuid.UUID, CampaignAudience] = {
        row.hcp_id: row for row in existing_result.scalars().all()
    }

    upserted: list[CampaignAudience] = []
    for m in members:
        if m.hcp_id in existing_map:
            row = existing_map[m.hcp_id]
            row.selected = m.selected
            row.priority_order = m.priority_order
            upserted.append(row)
        else:
            new_row = CampaignAudience(
                campaign_id=campaign_id,
                hcp_id=m.hcp_id,
                selected=m.selected,
                priority_order=m.priority_order,
            )
            db.add(new_row)
            upserted.append(new_row)

    await db.flush()
    for row in upserted:
        await db.refresh(row)
    return upserted


# ---------- MLR Scripts ----------


async def get_mlr_scripts(db: AsyncSession, campaign_id: uuid.UUID) -> list[MLRScript]:
    """Return MLR scripts for a campaign."""
    await get_campaign(db, campaign_id)
    result = await db.execute(
        select(MLRScript)
        .where(MLRScript.campaign_id == campaign_id)
        .order_by(MLRScript.created_at.desc())
    )
    return list(result.scalars().all())


async def upload_mlr_script(
    db: AsyncSession,
    campaign_id: uuid.UUID,
    version: str,
    s3_key: str,
) -> MLRScript:
    """Create a new MLR script record."""
    await get_campaign(db, campaign_id)
    script = MLRScript(
        campaign_id=campaign_id,
        version=version,
        s3_key=s3_key,
        status=MLRStatus.DRAFT,
    )
    db.add(script)
    await db.flush()
    await db.refresh(script)
    return script
