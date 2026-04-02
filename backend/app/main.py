"""FastAPI application factory for EngagementVerse."""

from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

# ---------------------------------------------------------------------------
# Structured JSON logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
)
logger = logging.getLogger("engagementverse")

# ---------------------------------------------------------------------------
# Module-level Redis pool (populated during lifespan)
# ---------------------------------------------------------------------------
redis_pool: aioredis.Redis | None = None


# ---------------------------------------------------------------------------
# Lifespan – startup / shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    global redis_pool
    settings = get_settings()
    logger.info("Starting up – connecting to Redis at %s", settings.REDIS_URL)
    redis_pool = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
    yield
    # Shutdown
    if redis_pool is not None:
        await redis_pool.aclose()  # type: ignore[union-attr]
        logger.info("Redis connection closed")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="EngagementVerse API",
        version="0.1.0",
        description="AI-powered HCP/KOL calling platform for pharma",
        lifespan=lifespan,
    )

    # ---- CORS middleware ----
    if settings.ENVIRONMENT == "development":
        allow_origins = ["*"]
    else:
        allow_origins = [
            "https://engagementverse.example.com",
        ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---- Request-ID middleware ----
    @app.middleware("http")
    async def add_request_id(request: Request, call_next) -> Response:  # type: ignore[type-arg]
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        logger.info(
            "request_start method=%s path=%s request_id=%s",
            request.method,
            request.url.path,
            request_id,
        )
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "request_end status=%s request_id=%s",
            response.status_code,
            request_id,
        )
        return response

    # ---- Health endpoint ----
    @app.get("/health", tags=["infra"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    # ---- Mount API v1 router ----
    from app.api.v1.router import api_v1_router

    app.include_router(api_v1_router, prefix="/api/v1")

    # ---- Mount WebSocket ----
    from app.websocket.call_stream import ws_router

    app.include_router(ws_router)

    return app


app = create_app()
