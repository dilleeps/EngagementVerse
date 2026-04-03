"""Sales lead endpoints."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, File
from fastapi.responses import Response

from app.infra.deps import get_current_user, get_db
from app.models.lead import LeadSource, LeadStatus
from app.models.user import AppUser
from app.schemas.lead import (
    HubSpotImportRequest,
    LeadCreate,
    LeadImportResult,
    LeadListResponse,
    LeadResponse,
    LeadStageUpdate,
    LeadUpdate,
)
from app.services import hubspot_service, lead_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.get("/stats", response_model=dict)
async def lead_stats(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return pipeline statistics."""
    return await lead_service.get_lead_stats(db)


@router.get("", response_model=LeadListResponse)
async def list_leads(
    lead_status: Optional[LeadStatus] = Query(None, alias="status"),
    lead_source: Optional[LeadSource] = Query(None, alias="source"),
    assigned_to: Optional[uuid.UUID] = Query(None),
    q: Optional[str] = Query(None, description="Free-text search"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadListResponse:
    """Paginated and filterable list of leads."""
    return await lead_service.list_leads(
        db,
        lead_status=lead_status,
        lead_source=lead_source,
        assigned_to=assigned_to,
        q=q,
        page=page,
        size=size,
    )


@router.post("", response_model=LeadResponse, status_code=201)
async def create_lead(
    body: LeadCreate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """Create a new lead."""
    lead = await lead_service.create_lead(db, body, current_user)
    return LeadResponse.model_validate(lead)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """Get a lead by id."""
    lead = await lead_service.get_lead(db, lead_id)
    return LeadResponse.model_validate(lead)


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: uuid.UUID,
    body: LeadUpdate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """Update a lead."""
    lead = await lead_service.update_lead(db, lead_id, body)
    return LeadResponse.model_validate(lead)


@router.delete("/{lead_id}", status_code=204, response_class=Response)
async def delete_lead(
    lead_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a lead."""
    await lead_service.delete_lead(db, lead_id)


@router.post("/bulk-import", response_model=LeadImportResult)
async def bulk_import(
    file: UploadFile = File(...),
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadImportResult:
    """Bulk import leads from an uploaded CSV file."""
    content = await file.read()
    csv_text = content.decode("utf-8-sig")
    return await lead_service.bulk_import_csv(db, csv_text, current_user)


@router.post("/hubspot-import", response_model=LeadImportResult)
async def hubspot_import(
    body: HubSpotImportRequest,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadImportResult:
    """Import contacts from HubSpot CRM as leads."""
    return await hubspot_service.sync_contacts_to_leads(
        db, body.api_key, current_user, limit=body.limit or 100
    )


@router.put("/{lead_id}/stage", response_model=LeadResponse)
async def update_lead_stage(
    lead_id: uuid.UUID,
    body: LeadStageUpdate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    """Update the pipeline stage of a lead."""
    lead = await lead_service.update_lead_stage(db, lead_id, body.lead_status)
    return LeadResponse.model_validate(lead)
