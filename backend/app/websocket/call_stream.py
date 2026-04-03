"""WebSocket endpoint for real-time call transcript streaming via Redis pub/sub."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import redis.asyncio as aioredis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import get_settings

logger = logging.getLogger("engagementverse.ws")

ws_router = APIRouter()


# ---------------------------------------------------------------------------
# Simple connection manager (kept for optional direct broadcasting)
# ---------------------------------------------------------------------------


class ConnectionManager:
    """Track active WebSocket connections keyed by call_id."""

    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, call_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections.setdefault(call_id, []).append(ws)
        logger.info("ws_connect call_id=%s clients=%d", call_id, len(self._connections[call_id]))

    def disconnect(self, call_id: str, ws: WebSocket) -> None:
        conns = self._connections.get(call_id, [])
        if ws in conns:
            conns.remove(ws)
        if not conns:
            self._connections.pop(call_id, None)
        logger.info("ws_disconnect call_id=%s", call_id)

    async def broadcast(self, call_id: str, message: dict[str, Any]) -> None:
        payload = json.dumps(message)
        for ws in list(self._connections.get(call_id, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                self.disconnect(call_id, ws)


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# WebSocket route with Redis pub/sub
# ---------------------------------------------------------------------------


@ws_router.websocket("/ws/calls/{call_id}/transcript")
async def call_transcript_stream(websocket: WebSocket, call_id: str) -> None:
    """Stream real-time transcript lines for a call.

    Subscribes to the Redis pub/sub channel ``call:{call_id}:transcript`` and
    forwards every published message to the connected WebSocket client.  Also
    handles inbound client messages (e.g. heartbeat pings).
    """
    await manager.connect(call_id, websocket)

    settings = get_settings()
    redis_conn = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = redis_conn.pubsub()
    channel_name = f"call:{call_id}:transcript"

    try:
        await pubsub.subscribe(channel_name)

        async def _relay_redis() -> None:
            """Read from Redis pub/sub and forward to WebSocket."""
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        await websocket.send_text(message["data"])
                    except Exception:
                        break

        async def _handle_client() -> None:
            """Read from WebSocket (heartbeats, etc.)."""
            while True:
                data = await websocket.receive_text()
                try:
                    msg = json.loads(data)
                    if msg.get("type") == "ping":
                        await websocket.send_text(json.dumps({"type": "pong"}))
                except (json.JSONDecodeError, TypeError):
                    pass

        # Run both tasks concurrently; when either finishes the other is cancelled
        relay_task = asyncio.create_task(_relay_redis())
        client_task = asyncio.create_task(_handle_client())

        done, pending = await asyncio.wait(
            {relay_task, client_task},
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()

    except WebSocketDisconnect:
        logger.info("Client disconnected from call_id=%s", call_id)
    except Exception:
        logger.exception("Unexpected error in ws call_id=%s", call_id)
    finally:
        manager.disconnect(call_id, websocket)
        await pubsub.unsubscribe(channel_name)
        await pubsub.aclose()
        await redis_conn.aclose()
