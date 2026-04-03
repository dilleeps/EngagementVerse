"""Pydantic v2 schemas for Email Template endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.email_template import TemplateCategory


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------

class EmailTemplateBase(BaseModel):
    """Fields shared by create / update / response."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    subject: str
    body: str
    category: TemplateCategory = TemplateCategory.GENERAL
    variables: Optional[list[str]] = None
    is_active: bool = True
    preview_text: Optional[str] = None


# ---------------------------------------------------------------------------
# Create / Update
# ---------------------------------------------------------------------------

class EmailTemplateCreate(EmailTemplateBase):
    """Payload for POST /email-templates."""
    pass


class EmailTemplateUpdate(BaseModel):
    """Payload for PUT /email-templates/{id} - every field optional."""

    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    category: Optional[TemplateCategory] = None
    variables: Optional[list[str]] = None
    is_active: Optional[bool] = None
    preview_text: Optional[str] = None


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class EmailTemplateResponse(EmailTemplateBase):
    """Single email template record returned from the API."""

    id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


class EmailTemplateListResponse(BaseModel):
    """Paginated list of email templates."""

    model_config = ConfigDict(from_attributes=True)

    items: list[EmailTemplateResponse]
    total: int
    page: int
    size: int


# ---------------------------------------------------------------------------
# Preview
# ---------------------------------------------------------------------------

class TemplatePreviewRequest(BaseModel):
    """Request body for template preview rendering."""

    variable_values: dict[str, str] = Field(
        default_factory=dict,
        description="Mapping of variable names to values for rendering",
    )


class TemplatePreviewResponse(BaseModel):
    """Rendered template preview."""

    rendered_subject: str
    rendered_body: str


# ---------------------------------------------------------------------------
# Category count
# ---------------------------------------------------------------------------

class CategoryCount(BaseModel):
    """Category with its template count."""

    category: TemplateCategory
    count: int
