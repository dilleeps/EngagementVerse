"""Service layer for sales leads and pipeline management."""

from __future__ import annotations

import csv
import io
import uuid
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy import case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead, LeadSource, LeadStatus
from app.models.user import AppUser
from app.schemas.lead import (
    LeadCreate,
    LeadImportResult,
    LeadListResponse,
    LeadResponse,
    LeadUpdate,
)


async def list_leads(
    db: AsyncSession,
    *,
    lead_status: Optional[LeadStatus] = None,
    lead_source: Optional[LeadSource] = None,
    assigned_to: Optional[uuid.UUID] = None,
    q: Optional[str] = None,
    page: int = 1,
    size: int = 20,
) -> LeadListResponse:
    """Search and paginate leads with optional filters."""
    stmt = select(Lead)

    if lead_status:
        stmt = stmt.where(Lead.lead_status == lead_status)
    if lead_source:
        stmt = stmt.where(Lead.lead_source == lead_source)
    if assigned_to:
        stmt = stmt.where(Lead.assigned_to == assigned_to)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Lead.company_name.ilike(pattern),
                Lead.contact_name.ilike(pattern),
                Lead.contact_email.ilike(pattern),
                Lead.institution.ilike(pattern),
            )
        )

    # Total count
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # Paginated results
    offset = (page - 1) * size
    stmt = stmt.order_by(Lead.created_at.desc()).offset(offset).limit(size)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return LeadListResponse(
        items=[LeadResponse.model_validate(r) for r in rows],
        total=total,
        page=page,
        size=size,
    )


async def get_lead(db: AsyncSession, lead_id: uuid.UUID) -> Lead:
    """Return a single lead or raise 404."""
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found"
        )
    return lead


async def create_lead(db: AsyncSession, data: LeadCreate, user: AppUser) -> Lead:
    """Create a new lead record."""
    lead = Lead(**data.model_dump(), created_by=user.id)
    db.add(lead)
    await db.flush()
    await db.refresh(lead)
    return lead


async def update_lead(
    db: AsyncSession, lead_id: uuid.UUID, data: LeadUpdate
) -> Lead:
    """Update an existing lead (partial update)."""
    lead = await get_lead(db, lead_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    await db.flush()
    await db.refresh(lead)
    return lead


async def delete_lead(db: AsyncSession, lead_id: uuid.UUID) -> None:
    """Delete a lead by id."""
    lead = await get_lead(db, lead_id)
    await db.delete(lead)
    await db.flush()


async def bulk_import_csv(
    db: AsyncSession, csv_data: str, user: AppUser
) -> LeadImportResult:
    """Import leads from CSV text content.

    Expected CSV columns (case-insensitive):
        company_name, contact_name, contact_email, contact_phone,
        title, specialty, institution, state, deal_value, notes, tags
    """
    imported = 0
    skipped = 0
    errors: list[str] = []

    reader = csv.DictReader(io.StringIO(csv_data))
    # Normalise header names to lower-case / underscored
    if reader.fieldnames:
        reader.fieldnames = [
            h.strip().lower().replace(" ", "_") for h in reader.fieldnames
        ]

    for row_num, row in enumerate(reader, start=2):  # row 1 is the header
        try:
            company = (row.get("company_name") or "").strip()
            name = (row.get("contact_name") or "").strip()
            email = (row.get("contact_email") or "").strip()

            if not company or not name or not email:
                skipped += 1
                errors.append(
                    f"Row {row_num}: missing required field (company_name, contact_name, or contact_email)"
                )
                continue

            # Check for duplicate by email
            existing = await db.execute(
                select(Lead).where(Lead.contact_email == email)
            )
            if existing.scalar_one_or_none() is not None:
                skipped += 1
                errors.append(f"Row {row_num}: duplicate email {email}")
                continue

            deal_value_raw = (row.get("deal_value") or "").strip()
            deal_value = float(deal_value_raw) if deal_value_raw else None

            lead = Lead(
                company_name=company,
                contact_name=name,
                contact_email=email,
                contact_phone=(row.get("contact_phone") or "").strip() or None,
                title=(row.get("title") or "").strip() or None,
                specialty=(row.get("specialty") or "").strip() or None,
                institution=(row.get("institution") or "").strip() or None,
                state=(row.get("state") or "").strip() or None,
                deal_value=deal_value,
                notes=(row.get("notes") or "").strip() or None,
                lead_source=LeadSource.CSV_IMPORT,
                created_by=user.id,
            )
            db.add(lead)
            imported += 1
        except Exception as exc:
            skipped += 1
            errors.append(f"Row {row_num}: {exc}")

    if imported:
        await db.flush()

    return LeadImportResult(imported=imported, skipped=skipped, errors=errors)


async def import_from_hubspot(
    db: AsyncSession,
    hubspot_contacts: list[dict[str, Any]],
    user: AppUser,
) -> LeadImportResult:
    """Import a list of HubSpot contact dicts as leads."""
    imported = 0
    skipped = 0
    errors: list[str] = []

    for contact in hubspot_contacts:
        try:
            hs_id = str(contact.get("id", ""))
            props = contact.get("properties", {})
            email = (props.get("email") or "").strip()
            if not email:
                skipped += 1
                errors.append(f"HubSpot contact {hs_id}: missing email")
                continue

            # Skip if already synced
            if hs_id:
                existing = await db.execute(
                    select(Lead).where(Lead.hubspot_id == hs_id)
                )
                if existing.scalar_one_or_none() is not None:
                    skipped += 1
                    errors.append(f"HubSpot contact {hs_id}: already imported")
                    continue

            first = (props.get("firstname") or "").strip()
            last = (props.get("lastname") or "").strip()
            contact_name = f"{first} {last}".strip() or email
            company = (props.get("company") or "").strip() or "Unknown"

            lead = Lead(
                company_name=company,
                contact_name=contact_name,
                contact_email=email,
                contact_phone=(props.get("phone") or "").strip() or None,
                title=(props.get("jobtitle") or "").strip() or None,
                hubspot_id=hs_id or None,
                lead_source=LeadSource.HUBSPOT,
                created_by=user.id,
            )
            db.add(lead)
            imported += 1
        except Exception as exc:
            skipped += 1
            errors.append(f"HubSpot contact: {exc}")

    if imported:
        await db.flush()

    return LeadImportResult(imported=imported, skipped=skipped, errors=errors)


async def get_lead_stats(db: AsyncSession) -> dict[str, Any]:
    """Return pipeline statistics: counts per status and total pipeline value."""
    # Counts per status
    count_stmt = (
        select(Lead.lead_status, func.count(Lead.id))
        .group_by(Lead.lead_status)
    )
    count_result = await db.execute(count_stmt)
    status_counts: dict[str, int] = {
        row[0].value: row[1] for row in count_result.all()
    }

    # Total pipeline value (excluding WON and LOST)
    pipeline_value_stmt = select(func.coalesce(func.sum(Lead.deal_value), 0.0)).where(
        Lead.lead_status.notin_([LeadStatus.WON, LeadStatus.LOST])
    )
    pipeline_value = (await db.execute(pipeline_value_stmt)).scalar_one()

    # Won value
    won_value_stmt = select(func.coalesce(func.sum(Lead.deal_value), 0.0)).where(
        Lead.lead_status == LeadStatus.WON
    )
    won_value = (await db.execute(won_value_stmt)).scalar_one()

    # Total leads
    total_stmt = select(func.count(Lead.id))
    total = (await db.execute(total_stmt)).scalar_one()

    return {
        "total_leads": total,
        "status_counts": status_counts,
        "pipeline_value": float(pipeline_value),
        "won_value": float(won_value),
    }


async def update_lead_stage(
    db: AsyncSession, lead_id: uuid.UUID, new_status: LeadStatus
) -> Lead:
    """Update just the pipeline stage / status of a lead."""
    lead = await get_lead(db, lead_id)
    lead.lead_status = new_status
    lead.pipeline_stage = new_status.value
    await db.flush()
    await db.refresh(lead)
    return lead
