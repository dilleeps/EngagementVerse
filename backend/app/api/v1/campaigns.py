"""Campaign endpoints."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.deps import get_current_user, get_db
from app.models.campaign import CampaignStatus
from app.models.user import AppUser
from app.schemas.campaign import (
    AudienceMember,
    AudienceUpsert,
    CampaignCreate,
    CampaignDetailResponse,
    CampaignResponse,
    CampaignUpdate,
    MLRScriptResponse,
)
from app.services import campaign_service

router = APIRouter()


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(
    status: Optional[CampaignStatus] = Query(None),
    drug_name: Optional[str] = Query(None),
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CampaignResponse]:
    """List all campaigns with optional filters."""
    campaigns = await campaign_service.list_campaigns(db, status_filter=status, drug_name=drug_name)
    return [CampaignResponse.model_validate(c) for c in campaigns]


@router.post("", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    body: CampaignCreate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignResponse:
    """Create a new campaign."""
    campaign = await campaign_service.create_campaign(db, body, current_user)
    return CampaignResponse.model_validate(campaign)


@router.get("/{campaign_id}", response_model=CampaignDetailResponse)
async def get_campaign(
    campaign_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignDetailResponse:
    """Get a campaign by id with audience, channels, and MLR scripts."""
    campaign = await campaign_service.get_campaign(db, campaign_id)
    return CampaignDetailResponse.model_validate(campaign)


@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: uuid.UUID,
    body: CampaignUpdate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignResponse:
    """Update a campaign."""
    campaign = await campaign_service.update_campaign(db, campaign_id, body)
    return CampaignResponse.model_validate(campaign)


@router.post("/{campaign_id}/launch", response_model=CampaignResponse)
async def launch_campaign(
    campaign_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignResponse:
    """Launch a campaign -- status must be APPROVED."""
    campaign = await campaign_service.launch_campaign(db, campaign_id)
    return CampaignResponse.model_validate(campaign)


@router.post("/{campaign_id}/pause", response_model=CampaignResponse)
async def pause_campaign(
    campaign_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignResponse:
    """Pause an active campaign."""
    campaign = await campaign_service.pause_campaign(db, campaign_id)
    return CampaignResponse.model_validate(campaign)


# ---------- Audience ----------


@router.get("/{campaign_id}/audience", response_model=list[AudienceMember])
async def list_audience(
    campaign_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AudienceMember]:
    """List audience members of a campaign."""
    rows = await campaign_service.get_audience(db, campaign_id)
    return [AudienceMember.model_validate(r) for r in rows]


@router.post("/{campaign_id}/audience", response_model=list[AudienceMember], status_code=201)
async def upsert_audience(
    campaign_id: uuid.UUID,
    body: AudienceUpsert,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AudienceMember]:
    """Bulk upsert audience members for a campaign."""
    rows = await campaign_service.upsert_audience(db, campaign_id, body.members)
    return [AudienceMember.model_validate(r) for r in rows]


# ---------- MLR Script ----------


@router.get("/{campaign_id}/mlr", response_model=list[MLRScriptResponse])
async def list_mlr_scripts(
    campaign_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MLRScriptResponse]:
    """List MLR scripts for a campaign."""
    scripts = await campaign_service.get_mlr_scripts(db, campaign_id)
    return [MLRScriptResponse.model_validate(s) for s in scripts]


@router.post("/{campaign_id}/mlr", response_model=MLRScriptResponse, status_code=201)
async def upload_mlr_script(
    campaign_id: uuid.UUID,
    version: str = Query("1.0"),
    file: UploadFile = File(...),
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MLRScriptResponse:
    """Upload an MLR script for a campaign."""
    s3_key = f"mlr/{campaign_id}/{version}/{file.filename}"
    script = await campaign_service.upload_mlr_script(db, campaign_id, version, s3_key)
    return MLRScriptResponse.model_validate(script)
