"""Call session, transcript, and AI-insight models."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.hcp import ChannelType


# ---- Enums ----

class CallStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    LIVE = "LIVE"
    COMPLETED = "COMPLETED"
    NO_ANSWER = "NO_ANSWER"
    ESCALATED = "ESCALATED"
    OPTED_OUT = "OPTED_OUT"


class SpeakerType(str, enum.Enum):
    AI = "AI"
    HCP = "HCP"


class InsightType(str, enum.Enum):
    UPSELL = "UPSELL"
    FLAG_MLR = "FLAG_MLR"
    ENGAGEMENT_SCORE = "ENGAGEMENT_SCORE"
    SUGGEST_DATA = "SUGGEST_DATA"
    NEXT_BEST_ACTION = "NEXT_BEST_ACTION"


# ---- ORM models ----

class CallSession(Base):
    __tablename__ = "call_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hcp_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False
    )
    campaign_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True
    )
    initiated_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False
    )
    status: Mapped[CallStatus] = mapped_column(
        Enum(CallStatus, name="call_status_enum", create_constraint=True),
        default=CallStatus.QUEUED,
        nullable=False,
    )
    channel: Mapped[ChannelType] = mapped_column(
        Enum(ChannelType, name="channel_type_enum", create_type=False, create_constraint=True),
        nullable=False,
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    connect_contact_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    escalated_to_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=True
    )
    escalation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    crm_synced_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    crm_record_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    outcome_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    engagement_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # relationships
    transcripts: Mapped[list["Transcript"]] = relationship(
        back_populates="call_session", cascade="all, delete-orphan", lazy="selectin"
    )
    insights: Mapped[list["AIInsight"]] = relationship(
        back_populates="call_session", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<CallSession {self.id} status={self.status.value}>"


class Transcript(Base):
    __tablename__ = "transcripts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("call_sessions.id", ondelete="CASCADE"), nullable=False
    )
    speaker: Mapped[SpeakerType] = mapped_column(
        Enum(SpeakerType, name="speaker_type_enum", create_constraint=True),
        nullable=False,
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp_offset_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    call_session: Mapped["CallSession"] = relationship(back_populates="transcripts")

    def __repr__(self) -> str:
        return f"<Transcript {self.id} speaker={self.speaker.value}>"


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("call_sessions.id", ondelete="CASCADE"), nullable=False
    )
    insight_type: Mapped[InsightType] = mapped_column(
        Enum(InsightType, name="insight_type_enum", create_constraint=True),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    call_session: Mapped["CallSession"] = relationship(back_populates="insights")

    def __repr__(self) -> str:
        return f"<AIInsight {self.insight_type.value} conf={self.confidence}>"
