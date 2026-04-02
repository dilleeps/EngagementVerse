"""Python enums used across the domain models.

NOTE: The canonical enum definitions live in each model file (hcp.py, call.py,
campaign.py, user.py).  This module re-exports them for convenience so that
consumer code can do ``from app.models.enums import Specialty`` etc.
"""

from __future__ import annotations

# Re-export all enums from the individual model modules
from app.models.hcp import ChannelType, KOLTier, Specialty  # noqa: F401
from app.models.user import UserRole  # noqa: F401
from app.models.call import CallStatus, InsightType, SpeakerType  # noqa: F401
from app.models.campaign import CampaignStatus, CommunicationType, MLRStatus  # noqa: F401
