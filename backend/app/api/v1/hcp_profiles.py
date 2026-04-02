"""HCP profile endpoints."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, File

from app.config import Settings, get_settings
from app.infra.deps import get_current_user, get_db
from app.models.hcp import KOLTier, Specialty
from app.models.user import AppUser
from app.schemas.hcp import (
    EngagementEvent,
    HCPCreate,
    HCPDetailResponse,
    HCPListResponse,
    HCPResponse,
    HCPUpdate,
    PrescribingBehaviorResponse,
)
from app.services import hcp_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("", response_model=HCPListResponse)
async def list_hcps(
    q: Optional[str] = Query(None, description="Free-text search"),
    specialty: Optional[Specialty] = Query(None),
    kol_tier: Optional[KOLTier] = Query(None),
    state: Optional[str] = Query(None, max_length=2),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HCPListResponse:
    """Paginated and filterable list of HCPs."""
    return await hcp_service.search_hcps(
        db, q=q, specialty=specialty, kol_tier=kol_tier, state=state, page=page, size=size
    )


@router.get("/{hcp_id}", response_model=HCPDetailResponse)
async def get_hcp(
    hcp_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HCPDetailResponse:
    """Get HCP by id with prescribing behaviours."""
    hcp = await hcp_service.get_hcp(db, hcp_id)
    return HCPDetailResponse.model_validate(hcp)


@router.post("", response_model=HCPResponse, status_code=201)
async def create_hcp(
    body: HCPCreate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HCPResponse:
    """Create a new HCP."""
    hcp = await hcp_service.create_hcp(db, body)
    return HCPResponse.model_validate(hcp)


@router.put("/{hcp_id}", response_model=HCPResponse)
async def update_hcp(
    hcp_id: uuid.UUID,
    body: HCPUpdate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HCPResponse:
    """Update an HCP."""
    hcp = await hcp_service.update_hcp(db, hcp_id, body)
    return HCPResponse.model_validate(hcp)


@router.get("/{hcp_id}/prescribing", response_model=list[PrescribingBehaviorResponse])
async def get_prescribing(
    hcp_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PrescribingBehaviorResponse]:
    """Return prescribing behaviours for an HCP."""
    rows = await hcp_service.get_prescribing(db, hcp_id)
    return [PrescribingBehaviorResponse.model_validate(r) for r in rows]


@router.get("/{hcp_id}/engagement", response_model=list[EngagementEvent])
async def get_engagement(
    hcp_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[EngagementEvent]:
    """Return engagement timeline for an HCP."""
    return await hcp_service.get_engagement_timeline(db, hcp_id)


@router.post("/bulk-import", status_code=202)
async def bulk_import(
    file: UploadFile = File(...),
    current_user: AppUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> dict:
    """Bulk import HCPs from an uploaded CSV file.

    The file is referenced by S3 key and processing is enqueued to SQS.
    """
    s3_key = f"imports/{file.filename}"
    result = await hcp_service.bulk_import_hcps(s3_key, settings)
    return result
