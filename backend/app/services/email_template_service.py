"""Service layer for email templates."""

from __future__ import annotations

import re
import uuid
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_template import EmailTemplate, TemplateCategory
from app.models.user import AppUser
from app.schemas.email_template import (
    CategoryCount,
    EmailTemplateCreate,
    EmailTemplateListResponse,
    EmailTemplateResponse,
    EmailTemplateUpdate,
    TemplatePreviewResponse,
)


async def list_templates(
    db: AsyncSession,
    *,
    category: Optional[TemplateCategory] = None,
    is_active: Optional[bool] = None,
    q: Optional[str] = None,
    page: int = 1,
    size: int = 20,
) -> EmailTemplateListResponse:
    """Search and paginate email templates with optional filters."""
    stmt = select(EmailTemplate)

    if category:
        stmt = stmt.where(EmailTemplate.category == category)
    if is_active is not None:
        stmt = stmt.where(EmailTemplate.is_active == is_active)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                EmailTemplate.name.ilike(pattern),
                EmailTemplate.subject.ilike(pattern),
                EmailTemplate.preview_text.ilike(pattern),
            )
        )

    # Total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Paginated results
    offset = (page - 1) * size
    stmt = stmt.order_by(EmailTemplate.created_at.desc()).offset(offset).limit(size)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return EmailTemplateListResponse(
        items=[EmailTemplateResponse.model_validate(r) for r in rows],
        total=total,
        page=page,
        size=size,
    )


async def get_template(db: AsyncSession, template_id: uuid.UUID) -> EmailTemplate:
    """Return a single email template or raise 404."""
    result = await db.execute(
        select(EmailTemplate).where(EmailTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email template not found",
        )
    return template


async def create_template(
    db: AsyncSession, data: EmailTemplateCreate, user: AppUser
) -> EmailTemplate:
    """Create a new email template."""
    template = EmailTemplate(**data.model_dump(), created_by=user.id)
    db.add(template)
    await db.flush()
    await db.refresh(template)
    return template


async def update_template(
    db: AsyncSession, template_id: uuid.UUID, data: EmailTemplateUpdate
) -> EmailTemplate:
    """Update an existing email template (partial update)."""
    template = await get_template(db, template_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    await db.flush()
    await db.refresh(template)
    return template


async def delete_template(db: AsyncSession, template_id: uuid.UUID) -> None:
    """Delete an email template by id."""
    template = await get_template(db, template_id)
    await db.delete(template)
    await db.flush()


def preview_template(
    template: EmailTemplate, variable_values: dict[str, str]
) -> TemplatePreviewResponse:
    """Render a template by replacing {{variable}} placeholders with values."""
    rendered_subject = _replace_variables(template.subject, variable_values)
    rendered_body = _replace_variables(template.body, variable_values)
    return TemplatePreviewResponse(
        rendered_subject=rendered_subject,
        rendered_body=rendered_body,
    )


def _replace_variables(text: str, variable_values: dict[str, str]) -> str:
    """Replace all {{variable_name}} occurrences with provided values."""

    def replacer(match: re.Match) -> str:
        var_name = match.group(1).strip()
        return variable_values.get(var_name, match.group(0))

    return re.sub(r"\{\{(\s*\w+\s*)\}\}", replacer, text)


async def duplicate_template(
    db: AsyncSession, template_id: uuid.UUID, user: AppUser
) -> EmailTemplate:
    """Create a copy of an existing template."""
    original = await get_template(db, template_id)
    new_template = EmailTemplate(
        name=f"{original.name} (Copy)",
        subject=original.subject,
        body=original.body,
        category=original.category,
        variables=original.variables,
        is_active=False,
        preview_text=original.preview_text,
        created_by=user.id,
    )
    db.add(new_template)
    await db.flush()
    await db.refresh(new_template)
    return new_template


async def get_template_categories(db: AsyncSession) -> list[CategoryCount]:
    """Return all categories with their template counts."""
    stmt = (
        select(EmailTemplate.category, func.count(EmailTemplate.id))
        .group_by(EmailTemplate.category)
    )
    result = await db.execute(stmt)
    rows = result.all()

    # Build a dict from DB results
    counts: dict[str, int] = {row[0].value: row[1] for row in rows}

    # Return all categories, including those with 0 count
    return [
        CategoryCount(category=cat, count=counts.get(cat.value, 0))
        for cat in TemplateCategory
    ]
