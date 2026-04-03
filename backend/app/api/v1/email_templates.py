"""Email template endpoints."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.deps import get_current_user, get_db
from app.models.email_template import TemplateCategory
from app.models.user import AppUser
from app.schemas.email_template import (
    CategoryCount,
    EmailTemplateCreate,
    EmailTemplateListResponse,
    EmailTemplateResponse,
    EmailTemplateUpdate,
    TemplatePreviewRequest,
    TemplatePreviewResponse,
)
from app.services import email_template_service

router = APIRouter()


@router.get("/categories", response_model=list[CategoryCount])
async def list_categories(
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CategoryCount]:
    """List all template categories with counts."""
    return await email_template_service.get_template_categories(db)


@router.get("", response_model=EmailTemplateListResponse)
async def list_templates(
    category: Optional[TemplateCategory] = Query(None),
    is_active: Optional[bool] = Query(None),
    q: Optional[str] = Query(None, description="Free-text search"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EmailTemplateListResponse:
    """Paginated and filterable list of email templates."""
    return await email_template_service.list_templates(
        db,
        category=category,
        is_active=is_active,
        q=q,
        page=page,
        size=size,
    )


@router.post("", response_model=EmailTemplateResponse, status_code=201)
async def create_template(
    body: EmailTemplateCreate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EmailTemplateResponse:
    """Create a new email template."""
    template = await email_template_service.create_template(db, body, current_user)
    return EmailTemplateResponse.model_validate(template)


@router.get("/{template_id}", response_model=EmailTemplateResponse)
async def get_template(
    template_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EmailTemplateResponse:
    """Get an email template by id."""
    template = await email_template_service.get_template(db, template_id)
    return EmailTemplateResponse.model_validate(template)


@router.put("/{template_id}", response_model=EmailTemplateResponse)
async def update_template(
    template_id: uuid.UUID,
    body: EmailTemplateUpdate,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EmailTemplateResponse:
    """Update an email template."""
    template = await email_template_service.update_template(db, template_id, body)
    return EmailTemplateResponse.model_validate(template)


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete an email template."""
    await email_template_service.delete_template(db, template_id)


@router.post("/{template_id}/preview", response_model=TemplatePreviewResponse)
async def preview_template(
    template_id: uuid.UUID,
    body: TemplatePreviewRequest,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TemplatePreviewResponse:
    """Render a template with provided variable values."""
    template = await email_template_service.get_template(db, template_id)
    return email_template_service.preview_template(template, body.variable_values)


@router.post("/{template_id}/duplicate", response_model=EmailTemplateResponse, status_code=201)
async def duplicate_template(
    template_id: uuid.UUID,
    current_user: AppUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EmailTemplateResponse:
    """Create a copy of an existing template."""
    template = await email_template_service.duplicate_template(db, template_id, current_user)
    return EmailTemplateResponse.model_validate(template)
