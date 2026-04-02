"""Initial migration – create all tables.

Revision ID: 001_initial
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ---- Enum types ----
    specialty_enum = sa.Enum(
        "RHEUMATOLOGY", "DERMATOLOGY", "GASTROENTEROLOGY",
        "HEMATOLOGY", "ONCOLOGY", "OTHER",
        name="specialty_enum",
    )
    specialty_enum.create(op.get_bind(), checkfirst=True)

    kol_tier_enum = sa.Enum("TIER_1", "TIER_2", "TIER_3", "NONE", name="kol_tier_enum")
    kol_tier_enum.create(op.get_bind(), checkfirst=True)

    channel_type_enum = sa.Enum("VOICE", "SMS", "EMAIL", "DIGITAL", name="channel_type_enum")
    channel_type_enum.create(op.get_bind(), checkfirst=True)

    user_role_enum = sa.Enum(
        "MSL_LEAD", "COMMERCIAL_OPS", "MEDICAL_AFFAIRS",
        "BRAND_MARKETING", "KOL_MANAGEMENT",
        name="user_role_enum",
    )
    user_role_enum.create(op.get_bind(), checkfirst=True)

    call_status_enum = sa.Enum(
        "QUEUED", "LIVE", "COMPLETED", "NO_ANSWER", "ESCALATED", "OPTED_OUT",
        name="call_status_enum",
    )
    call_status_enum.create(op.get_bind(), checkfirst=True)

    speaker_type_enum = sa.Enum("AI", "HCP", name="speaker_type_enum")
    speaker_type_enum.create(op.get_bind(), checkfirst=True)

    insight_type_enum = sa.Enum(
        "UPSELL", "FLAG_MLR", "ENGAGEMENT_SCORE", "SUGGEST_DATA", "NEXT_BEST_ACTION",
        name="insight_type_enum",
    )
    insight_type_enum.create(op.get_bind(), checkfirst=True)

    campaign_status_enum = sa.Enum(
        "DRAFT", "PENDING_MLR", "APPROVED", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED",
        name="campaign_status_enum",
    )
    campaign_status_enum.create(op.get_bind(), checkfirst=True)

    mlr_status_enum = sa.Enum("DRAFT", "SUBMITTED", "APPROVED", "REJECTED", name="mlr_status_enum")
    mlr_status_enum.create(op.get_bind(), checkfirst=True)

    # ---- hcps ----
    op.create_table(
        "hcps",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("npi", sa.String(20), nullable=False, unique=True),
        sa.Column("first_name", sa.String(120), nullable=False),
        sa.Column("last_name", sa.String(120), nullable=False),
        sa.Column("specialty", specialty_enum, nullable=False),
        sa.Column("institution", sa.String(255), nullable=True),
        sa.Column("state", sa.String(2), nullable=True),
        sa.Column("kol_tier", kol_tier_enum, nullable=False, server_default="NONE"),
        sa.Column("influence_score", sa.Float, nullable=True),
        sa.Column("engagement_score", sa.Float, nullable=True),
        sa.Column("preferred_channel", channel_type_enum, nullable=True),
        sa.Column("best_contact_time", sa.String(50), nullable=True),
        sa.Column("publications_count", sa.Integer, default=0),
        sa.Column("citations_count", sa.Integer, default=0),
        sa.Column("tags", postgresql.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_hcps_npi", "hcps", ["npi"])
    op.create_index("ix_hcps_specialty", "hcps", ["specialty"])
    op.create_index("ix_hcps_state", "hcps", ["state"])
    op.create_index("ix_hcps_kol_tier", "hcps", ["kol_tier"])
    op.create_index("ix_hcps_last_name", "hcps", ["last_name"])

    # ---- prescribing_behaviors ----
    op.create_table(
        "prescribing_behaviors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("hcp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("drug_name", sa.String(200), nullable=False),
        sa.Column("monthly_volume", sa.Integer, nullable=True),
        sa.Column("trend_pct", sa.Float, nullable=True),
        sa.Column("share_of_wallet_pct", sa.Float, nullable=True),
        sa.Column("recorded_month", sa.Date, nullable=True),
    )
    op.create_index("ix_prescribing_hcp_id", "prescribing_behaviors", ["hcp_id"])
    op.create_index("ix_prescribing_drug", "prescribing_behaviors", ["drug_name"])

    # ---- app_users ----
    op.create_table(
        "app_users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("cognito_sub", sa.String(128), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_app_users_email", "app_users", ["email"])
    op.create_index("ix_app_users_cognito_sub", "app_users", ["cognito_sub"])

    # ---- campaigns ----
    op.create_table(
        "campaigns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("drug_name", sa.String(200), nullable=False),
        sa.Column("status", campaign_status_enum, nullable=False, server_default="DRAFT"),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("app_users.id"), nullable=False),
        sa.Column("target_specialty", sa.String(100), nullable=True),
        sa.Column("budget", sa.Float, nullable=True),
        sa.Column("metadata_json", postgresql.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_campaigns_status", "campaigns", ["status"])
    op.create_index("ix_campaigns_created_by", "campaigns", ["created_by"])

    # ---- call_sessions ----
    op.create_table(
        "call_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("hcp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("initiated_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("app_users.id"), nullable=False),
        sa.Column("status", call_status_enum, nullable=False, server_default="QUEUED"),
        sa.Column("channel", channel_type_enum, nullable=False),
        sa.Column("duration_seconds", sa.Integer, nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("connect_contact_id", sa.String(255), nullable=True),
        sa.Column("escalated_to_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("app_users.id"), nullable=True),
        sa.Column("escalation_reason", sa.Text, nullable=True),
        sa.Column("crm_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("crm_record_id", sa.String(255), nullable=True),
        sa.Column("outcome_notes", sa.Text, nullable=True),
        sa.Column("engagement_score", sa.Float, nullable=True),
    )
    op.create_index("ix_call_sessions_hcp_id", "call_sessions", ["hcp_id"])
    op.create_index("ix_call_sessions_campaign_id", "call_sessions", ["campaign_id"])
    op.create_index("ix_call_sessions_status", "call_sessions", ["status"])
    op.create_index("ix_call_sessions_started_at", "call_sessions", ["started_at"])

    # ---- transcripts ----
    op.create_table(
        "transcripts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("call_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("speaker", speaker_type_enum, nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("timestamp_offset_ms", sa.Integer, nullable=True),
        sa.Column("confidence_score", sa.Float, nullable=True),
    )
    op.create_index("ix_transcripts_call_id", "transcripts", ["call_id"])

    # ---- ai_insights ----
    op.create_table(
        "ai_insights",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("call_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("call_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("insight_type", insight_type_enum, nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ai_insights_call_id", "ai_insights", ["call_id"])
    op.create_index("ix_ai_insights_type", "ai_insights", ["insight_type"])

    # ---- campaign_audiences ----
    op.create_table(
        "campaign_audiences",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hcp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("priority", sa.Integer, default=0),
        sa.Column("metadata_json", postgresql.JSON, nullable=True),
    )
    op.create_index("ix_campaign_audiences_campaign", "campaign_audiences", ["campaign_id"])
    op.create_index("ix_campaign_audiences_hcp", "campaign_audiences", ["hcp_id"])

    # ---- campaign_channels ----
    op.create_table(
        "campaign_channels",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("channel_type", channel_type_enum, nullable=False),
        sa.Column("weight", sa.Float, default=1.0),
    )
    op.create_index("ix_campaign_channels_campaign", "campaign_channels", ["campaign_id"])

    # ---- mlr_scripts ----
    op.create_table(
        "mlr_scripts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version", sa.String(50), nullable=False),
        sa.Column("s3_key", sa.String(500), nullable=False),
        sa.Column("status", mlr_status_enum, nullable=False, server_default="DRAFT"),
        sa.Column("reviewer_notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_mlr_scripts_campaign", "mlr_scripts", ["campaign_id"])
    op.create_index("ix_mlr_scripts_status", "mlr_scripts", ["status"])


def downgrade() -> None:
    op.drop_table("mlr_scripts")
    op.drop_table("campaign_channels")
    op.drop_table("campaign_audiences")
    op.drop_table("ai_insights")
    op.drop_table("transcripts")
    op.drop_table("call_sessions")
    op.drop_table("campaigns")
    op.drop_table("app_users")
    op.drop_table("prescribing_behaviors")
    op.drop_table("hcps")

    for enum_name in [
        "mlr_status_enum",
        "campaign_status_enum",
        "insight_type_enum",
        "speaker_type_enum",
        "call_status_enum",
        "user_role_enum",
        "channel_type_enum",
        "kol_tier_enum",
        "specialty_enum",
    ]:
        sa.Enum(name=enum_name).drop(op.get_bind(), checkfirst=True)
