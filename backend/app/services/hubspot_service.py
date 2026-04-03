"""HubSpot CRM integration service."""

from __future__ import annotations

from typing import Any, Optional

import httpx
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead
from app.models.user import AppUser
from app.services.lead_service import import_from_hubspot

HUBSPOT_BASE_URL = "https://api.hubapi.com"
CONTACTS_URL = f"{HUBSPOT_BASE_URL}/crm/v3/objects/contacts"
DEALS_URL = f"{HUBSPOT_BASE_URL}/crm/v3/objects/deals"


def _auth_headers(api_key: str) -> dict[str, str]:
    """Return authorization headers for HubSpot private app token."""
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


async def fetch_contacts(
    api_key: str,
    limit: int = 100,
    after_cursor: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Fetch contacts from HubSpot CRM API.

    Returns a list of contact dicts with 'id' and 'properties' keys.
    """
    params: dict[str, Any] = {
        "limit": min(limit, 100),
        "properties": "email,firstname,lastname,company,phone,jobtitle",
    }
    if after_cursor:
        params["after"] = after_cursor

    contacts: list[dict[str, Any]] = []
    remaining = limit

    async with httpx.AsyncClient(timeout=30.0) as client:
        while remaining > 0:
            params["limit"] = min(remaining, 100)
            try:
                resp = await client.get(
                    CONTACTS_URL,
                    headers=_auth_headers(api_key),
                    params=params,
                )
                resp.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"HubSpot API error: {exc.response.status_code} – {exc.response.text[:300]}",
                )
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"HubSpot connection error: {exc}",
                )

            data = resp.json()
            results = data.get("results", [])
            contacts.extend(results)
            remaining -= len(results)

            # Pagination
            paging = data.get("paging", {})
            next_link = paging.get("next", {})
            after = next_link.get("after")
            if not after or not results:
                break
            params["after"] = after

    return contacts


async def sync_contacts_to_leads(
    db: AsyncSession,
    api_key: str,
    user: AppUser,
    limit: int = 100,
) -> Any:
    """Fetch HubSpot contacts and import them as leads.

    Returns a LeadImportResult.
    """
    contacts = await fetch_contacts(api_key, limit=limit)
    return await import_from_hubspot(db, contacts, user)


async def push_lead_to_hubspot(api_key: str, lead: Lead) -> dict[str, Any]:
    """Create or update a contact in HubSpot from a local lead.

    If the lead already has a hubspot_id, it will update the existing contact.
    Otherwise it creates a new one.
    """
    properties = {
        "email": lead.contact_email,
        "firstname": lead.contact_name.split(" ", 1)[0] if lead.contact_name else "",
        "lastname": lead.contact_name.split(" ", 1)[1]
        if lead.contact_name and " " in lead.contact_name
        else "",
        "company": lead.company_name,
        "phone": lead.contact_phone or "",
        "jobtitle": lead.title or "",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            if lead.hubspot_id:
                # Update existing contact
                resp = await client.patch(
                    f"{CONTACTS_URL}/{lead.hubspot_id}",
                    headers=_auth_headers(api_key),
                    json={"properties": properties},
                )
            else:
                # Create new contact
                resp = await client.post(
                    CONTACTS_URL,
                    headers=_auth_headers(api_key),
                    json={"properties": properties},
                )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"HubSpot API error: {exc.response.status_code} – {exc.response.text[:300]}",
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"HubSpot connection error: {exc}",
            )

    return resp.json()


async def get_hubspot_deals(api_key: str) -> list[dict[str, Any]]:
    """Fetch deals from HubSpot CRM API."""
    params: dict[str, Any] = {
        "limit": 100,
        "properties": "dealname,amount,dealstage,closedate,pipeline",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.get(
                DEALS_URL,
                headers=_auth_headers(api_key),
                params=params,
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"HubSpot API error: {exc.response.status_code} – {exc.response.text[:300]}",
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"HubSpot connection error: {exc}",
            )

    return resp.json().get("results", [])
