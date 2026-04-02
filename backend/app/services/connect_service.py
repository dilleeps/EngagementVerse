"""Service layer for Amazon Connect integration."""

from __future__ import annotations

import logging
from typing import Any

import boto3

from app.config import Settings

logger = logging.getLogger(__name__)


async def start_outbound_call(
    contact_id: str,
    phone_number: str,
    settings: Settings,
) -> dict[str, Any]:
    """Initiate an outbound call via Amazon Connect.

    In local/dev environments where CONNECT_INSTANCE_ID is empty, returns a
    stubbed response so that the rest of the flow can be exercised.
    """
    if not settings.CONNECT_INSTANCE_ID:
        logger.info(
            "Amazon Connect not configured -- returning stub for contact_id=%s, phone=%s",
            contact_id,
            phone_number,
        )
        return {
            "ContactId": f"stub-{contact_id}",
            "Connected": False,
            "Message": "Stubbed -- Connect not configured",
        }

    client = boto3.client(
        "connect",
        region_name=settings.AWS_DEFAULT_REGION,
        endpoint_url=settings.AWS_ENDPOINT_URL or None,
    )

    response = client.start_outbound_voice_contact(
        DestinationPhoneNumber=phone_number,
        ContactFlowId=settings.CONNECT_INSTANCE_ID,
        InstanceId=settings.CONNECT_INSTANCE_ID,
        SourcePhoneNumber="+18005551234",
        Attributes={
            "contactId": contact_id,
        },
    )
    logger.info("Connect outbound call started: %s", response.get("ContactId"))
    return {
        "ContactId": response.get("ContactId"),
        "Connected": True,
    }


async def handle_connect_event(event: dict[str, Any]) -> dict[str, Any]:
    """Process an incoming Amazon Connect contact-flow event.

    Events are forwarded from a Lambda integration. We extract key fields and
    return processing results that the caller can use to update call state.
    """
    event_type = event.get("EventType", "UNKNOWN")
    contact_id = event.get("ContactId", "")
    attributes = event.get("Attributes", {})

    logger.info(
        "Processing Connect event type=%s contact=%s",
        event_type,
        contact_id,
    )

    result: dict[str, Any] = {
        "event_type": event_type,
        "contact_id": contact_id,
        "processed": True,
    }

    if event_type == "INITIATED":
        result["action"] = "update_status_live"
    elif event_type == "CONNECTED_TO_AGENT":
        result["action"] = "escalation_connected"
    elif event_type == "DISCONNECTED":
        disconnect_reason = event.get("DisconnectReason", "UNKNOWN")
        result["action"] = "end_call"
        result["disconnect_reason"] = disconnect_reason
    elif event_type == "CONTACT_FLOW_EVENT":
        result["action"] = "log_flow_event"
        result["flow_data"] = attributes
    else:
        result["action"] = "noop"

    return result
