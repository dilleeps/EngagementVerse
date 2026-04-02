"""WebSocket endpoint for real-time call streaming events."""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("engagementverse.ws")

ws_router = APIRouter()

# ---------------------------------------------------------------------------
# Simple connection manager
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
# WebSocket route
# ---------------------------------------------------------------------------

@ws_router.websocket("/ws/calls/{call_id}")
async def call_stream(websocket: WebSocket, call_id: str) -> None:
    """Stream real-time transcript and insight events for a call."""
    await manager.connect(call_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming messages (e.g. client heartbeat)
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(call_id, websocket)
