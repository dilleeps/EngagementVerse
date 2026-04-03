"""SQS consumer worker for the call-dispatch.fifo queue.

Polls messages from SQS, looks up the target HCP, initiates an outbound call
via Amazon Connect, and updates the CallSession status.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid

import boto3
from sqlalchemy import select

from app.config import get_settings
from app.infra.database import async_session_factory
from app.models.call import CallSession, CallStatus
from app.models.hcp import HCP
from app.services.connect_service import start_outbound_call

logger = logging.getLogger("engagementverse.worker.call_dispatcher")

POLL_INTERVAL_SECONDS = 5
MAX_MESSAGES = 10


async def _process_message(message_body: dict) -> None:
    """Process a single call-dispatch message."""
    call_id = uuid.UUID(message_body["call_id"])
    hcp_id = uuid.UUID(message_body["hcp_id"])
    phone_number = message_body.get("phone_number", "+10000000000")

    settings = get_settings()

    async with async_session_factory() as db:
        # Look up HCP
        result = await db.execute(select(HCP).where(HCP.id == hcp_id))
        hcp = result.scalar_one_or_none()
        if hcp is None:
            logger.error("HCP %s not found, skipping dispatch", hcp_id)
            return

        # Look up CallSession
        result = await db.execute(select(CallSession).where(CallSession.id == call_id))
        call = result.scalar_one_or_none()
        if call is None:
            logger.error("CallSession %s not found, skipping dispatch", call_id)
            return

        # Initiate outbound call via Connect
        try:
            connect_result = await start_outbound_call(
                contact_id=str(call_id),
                phone_number=phone_number,
                settings=settings,
            )
            call.connect_contact_id = connect_result.get("ContactId")
            call.status = CallStatus.LIVE
            logger.info(
                "Call %s dispatched to Connect contact=%s",
                call_id,
                call.connect_contact_id,
            )
        except Exception:
            call.status = CallStatus.NO_ANSWER
            logger.exception("Failed to initiate Connect call for %s", call_id)

        await db.commit()


async def poll_loop() -> None:
    """Continuously poll SQS for call-dispatch messages."""
    settings = get_settings()
    sqs_url = settings.SQS_URL_CALL_EVENTS
    if not sqs_url:
        logger.warning("SQS_URL_CALL_EVENTS not configured; call_dispatcher idle")
        return

    sqs = boto3.client(
        "sqs",
        region_name=settings.AWS_DEFAULT_REGION,
        endpoint_url=settings.AWS_ENDPOINT_URL or None,
    )

    logger.info("call_dispatcher polling %s", sqs_url)

    while True:
        try:
            response = sqs.receive_message(
                QueueUrl=sqs_url,
                MaxNumberOfMessages=MAX_MESSAGES,
                WaitTimeSeconds=20,
            )
            messages = response.get("Messages", [])
            for msg in messages:
                body = json.loads(msg["Body"])
                logger.info("Received dispatch message: %s", body)
                await _process_message(body)
                sqs.delete_message(
                    QueueUrl=sqs_url,
                    ReceiptHandle=msg["ReceiptHandle"],
                )
        except Exception:
            logger.exception("Error polling SQS for call dispatch")
            await asyncio.sleep(POLL_INTERVAL_SECONDS)


def main() -> None:
    """Entry point for running the worker standalone."""
    logging.basicConfig(level=logging.INFO)
    asyncio.run(poll_loop())


if __name__ == "__main__":
    main()
