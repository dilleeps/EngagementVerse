"""API v1 router aggregating all sub-routers."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import analytics, auth, calls, campaigns, dashboard, hcp_profiles

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_v1_router.include_router(calls.router, prefix="/calls", tags=["calls"])
api_v1_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_v1_router.include_router(hcp_profiles.router, prefix="/hcp", tags=["hcp"])
api_v1_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
