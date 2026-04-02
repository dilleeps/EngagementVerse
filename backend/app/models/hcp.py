"""HCP and prescribing-behaviour models."""

from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from typing import Any, Optional

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


# ---- Python enums ----

class Specialty(str, enum.Enum):
    RHEUMATOLOGY = "RHEUMATOLOGY"
    DERMATOLOGY = "DERMATOLOGY"
    GASTROENTEROLOGY = "GASTROENTEROLOGY"
    HEMATOLOGY = "HEMATOLOGY"
    ONCOLOGY = "ONCOLOGY"
    OTHER = "OTHER"


class KOLTier(str, enum.Enum):
    TIER_1 = "TIER_1"
    TIER_2 = "TIER_2"
    TIER_3 = "TIER_3"
    NONE = "NONE"


class ChannelType(str, enum.Enum):
    VOICE = "VOICE"
    SMS = "SMS"
    EMAIL = "EMAIL"
    DIGITAL = "DIGITAL"


# ---- ORM models ----

class HCP(Base):
    __tablename__ = "hcps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    npi: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    specialty: Mapped[Specialty] = mapped_column(
        Enum(Specialty, name="specialty_enum", create_constraint=True),
        nullable=False,
    )
    institution: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    kol_tier: Mapped[KOLTier] = mapped_column(
        Enum(KOLTier, name="kol_tier_enum", create_constraint=True),
        default=KOLTier.NONE,
        server_default="NONE",
    )
    influence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    engagement_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    preferred_channel: Mapped[Optional[ChannelType]] = mapped_column(
        Enum(ChannelType, name="channel_type_enum", create_constraint=True),
        nullable=True,
    )
    best_contact_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    publications_count: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    citations_count: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    tags: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # relationships
    prescribing_behaviors: Mapped[list["PrescribingBehavior"]] = relationship(
        back_populates="hcp", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<HCP {self.npi} – {self.last_name}, {self.first_name}>"


class PrescribingBehavior(Base):
    __tablename__ = "prescribing_behaviors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hcp_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False
    )
    drug_name: Mapped[str] = mapped_column(String(200), nullable=False)
    monthly_volume: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    trend_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    share_of_wallet_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recorded_month: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    hcp: Mapped["HCP"] = relationship(back_populates="prescribing_behaviors")

    def __repr__(self) -> str:
        return f"<PrescribingBehavior {self.drug_name} for HCP {self.hcp_id}>"
