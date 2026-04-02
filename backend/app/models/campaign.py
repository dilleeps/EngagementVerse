"""Campaign, audience, channel, and MLR-script models."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
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

class CommunicationType(str, enum.Enum):
    LABEL_CHANGE = "LABEL_CHANGE"
    SAFETY_ALERT = "SAFETY_ALERT"
    PIPELINE_UPDATE = "PIPELINE_UPDATE"
    GENERAL = "GENERAL"


class CampaignStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_MLR = "PENDING_MLR"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"


class MLRStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# ---- ORM models ----

class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    drug_name: Mapped[str] = mapped_column(String(200), nullable=False)
    communication_type: Mapped[CommunicationType] = mapped_column(
        Enum(CommunicationType, name="communication_type_enum", create_constraint=True),
        nullable=False,
    )
    status: Mapped[CampaignStatus] = mapped_column(
        Enum(CampaignStatus, name="campaign_status_enum", create_constraint=True),
        default=CampaignStatus.DRAFT,
        nullable=False,
    )
    mlr_script_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    mlr_approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    mlr_approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # relationships
    audiences: Mapped[list["CampaignAudience"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan", lazy="selectin"
    )
    channels: Mapped[list["CampaignChannel"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan", lazy="selectin"
    )
    mlr_scripts: Mapped[list["MLRScript"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Campaign {self.name} status={self.status.value}>"


class CampaignAudience(Base):
    __tablename__ = "campaign_audiences"

    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        primary_key=True,
    )
    hcp_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hcps.id", ondelete="CASCADE"),
        primary_key=True,
    )
    selected: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    priority_order: Mapped[Optional[int]] = mapped_column(Integer, default=0)

    campaign: Mapped["Campaign"] = relationship(back_populates="audiences")

    def __repr__(self) -> str:
        return f"<CampaignAudience campaign={self.campaign_id} hcp={self.hcp_id}>"


class CampaignChannel(Base):
    __tablename__ = "campaign_channels"

    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        primary_key=True,
    )
    channel: Mapped[ChannelType] = mapped_column(
        Enum(ChannelType, name="channel_type_enum", create_type=False, create_constraint=True),
        primary_key=True,
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sequence_order: Mapped[Optional[int]] = mapped_column(Integer, default=0)

    campaign: Mapped["Campaign"] = relationship(back_populates="channels")

    def __repr__(self) -> str:
        return f"<CampaignChannel {self.channel.value}>"


class MLRScript(Base):
    __tablename__ = "mlr_scripts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False
    )
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    s3_key: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[MLRStatus] = mapped_column(
        Enum(MLRStatus, name="mlr_status_enum", create_constraint=True),
        default=MLRStatus.DRAFT,
        nullable=False,
    )
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app_users.id"), nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    campaign: Mapped["Campaign"] = relationship(back_populates="mlr_scripts")

    def __repr__(self) -> str:
        return f"<MLRScript v{self.version} status={self.status.value}>"
