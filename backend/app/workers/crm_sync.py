"""SQS consumer worker for the crm-sync.fifo queue.

Polls messages from SQS, looks up the corresponding CallSession, simulates a
CRM sync operation, and updates the ``crm_synced_at`` timestamp.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone

import boto3
from sqlalchemy import select

from app.config import get_settings
from app.infra.database import async_session_factory
from app.models.call import CallSession

logger = logging.getLogger("engagementverse.worker.crm_sync")

POLL_INTERVAL_SECONDS = 5
MAX_MESSAGES = 10


async def _process_message(message_body: dict) -> None:
    """Process a single CRM-sync message."""
    call_id = uuid.UUID(message_body["call_id"])

    async with async_session_factory() as db:
        result = await db.execute(select(CallSession).where(CallSession.id == call_id))
        call = result.scalar_one_or_none()
        if call is None:
            logger.error("CallSession %s not found, skipping CRM sync", call_id)
            return

        # Simulate CRM sync (in production: POST to Veeva/Salesforce)
        logger.info("Syncing call %s to CRM...", call_id)
        call.crm_synced_at = datetime.now(timezone.utc)
        call.crm_record_id = f"CRM-{uuid.uuid4().hex[:12].upper()}"
        await db.commit()
        logger.info(
            "CRM sync complete for call %s -> record %s",
            call_id,
            call.crm_record_id,
        )


async def poll_loop() -> None:
    """Continuously poll SQS for CRM-sync messages."""
    settings = get_settings()
    sqs_url = settings.SQS_URL_CRM_SYNC
    if not sqs_url:
        logger.warning("SQS_URL_CRM_SYNC not configured; crm_sync worker idle")
        return

    sqs = boto3.client(
        "sqs",
        region_name=settings.AWS_DEFAULT_REGION,
        endpoint_url=settings.AWS_ENDPOINT_URL or None,
    )

    logger.info("crm_sync polling %s", sqs_url)

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
                logger.info("Received CRM sync message: %s", body)
                await _process_message(body)
                sqs.delete_message(
                    QueueUrl=sqs_url,
                    ReceiptHandle=msg["ReceiptHandle"],
                )
        except Exception:
            logger.exception("Error polling SQS for CRM sync")
            await asyncio.sleep(POLL_INTERVAL_SECONDS)


def main() -> None:
    """Entry point for running the worker standalone."""
    logging.basicConfig(level=logging.INFO)
    asyncio.run(poll_loop())


if __name__ == "__main__":
    main()
