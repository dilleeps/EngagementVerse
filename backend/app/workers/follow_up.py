"""SQS consumer worker for the follow-up-tasks queue.

Polls messages from SQS and processes follow-up task creation. Follow-up tasks
are generated after calls (e.g. send materials, schedule next touchpoint).
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

logger = logging.getLogger("engagementverse.worker.follow_up")

POLL_INTERVAL_SECONDS = 5
MAX_MESSAGES = 10


async def _process_message(message_body: dict) -> None:
    """Process a single follow-up task message."""
    call_id_str = message_body.get("call_id")
    task_type = message_body.get("task_type", "generic_follow_up")
    notes = message_body.get("notes", "")

    if not call_id_str:
        logger.error("follow_up message missing call_id: %s", message_body)
        return

    call_id = uuid.UUID(call_id_str)

    async with async_session_factory() as db:
        result = await db.execute(select(CallSession).where(CallSession.id == call_id))
        call = result.scalar_one_or_none()
        if call is None:
            logger.error("CallSession %s not found, skipping follow-up", call_id)
            return

        # In production this would create a follow-up task in the task management
        # system, send an email, or schedule the next call.
        logger.info(
            "Creating follow-up task: call=%s type=%s hcp=%s notes=%s",
            call_id,
            task_type,
            call.hcp_id,
            notes[:80] if notes else "",
        )

        # Simulate task creation result
        task_id = uuid.uuid4()
        logger.info(
            "Follow-up task created: task_id=%s for call=%s at %s",
            task_id,
            call_id,
            datetime.now(timezone.utc).isoformat(),
        )


async def poll_loop() -> None:
    """Continuously poll SQS for follow-up task messages."""
    settings = get_settings()
    sqs_url = settings.SQS_FOLLOW_UP_URL
    if not sqs_url:
        logger.warning("Follow-up SQS queue not configured; follow_up worker idle")
        return

    sqs = boto3.client(
        "sqs",
        region_name=settings.AWS_DEFAULT_REGION,
        endpoint_url=settings.AWS_ENDPOINT_URL or None,
    )

    logger.info("follow_up worker polling %s", sqs_url)

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
                logger.info("Received follow-up message: %s", body)
                await _process_message(body)
                sqs.delete_message(
                    QueueUrl=sqs_url,
                    ReceiptHandle=msg["ReceiptHandle"],
                )
        except Exception:
            logger.exception("Error polling SQS for follow-up tasks")
            await asyncio.sleep(POLL_INTERVAL_SECONDS)


def main() -> None:
    """Entry point for running the worker standalone."""
    logging.basicConfig(level=logging.INFO)
    asyncio.run(poll_loop())


if __name__ == "__main__":
    main()
