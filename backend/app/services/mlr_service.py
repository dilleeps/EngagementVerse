"""Service layer for MLR (Medical-Legal-Regulatory) compliance checks."""

from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.campaign import Campaign, MLRScript, MLRStatus

# Phrases that would flag a script as non-compliant (simplified rule set)
PROHIBITED_PHRASES: list[str] = [
    "guaranteed cure",
    "100% effective",
    "no side effects",
    "miracle drug",
    "risk-free",
    "outperforms all competitors",
]

REQUIRED_SECTIONS: list[str] = [
    "indication",
    "important safety information",
    "adverse reactions",
]


def validate_script(script_text: str) -> dict[str, Any]:
    """Run basic compliance checks against a script body.

    Returns a dict with ``compliant`` (bool), ``score`` (0-100), and a list of
    ``issues`` describing each problem found.
    """
    issues: list[str] = []
    lower_text = script_text.lower()

    # Check for prohibited phrases
    for phrase in PROHIBITED_PHRASES:
        if phrase in lower_text:
            issues.append(f"Prohibited phrase detected: '{phrase}'")

    # Check for required sections
    for section in REQUIRED_SECTIONS:
        if section not in lower_text:
            issues.append(f"Missing required section: '{section}'")

    # Simple length check
    word_count = len(script_text.split())
    if word_count < 50:
        issues.append("Script is too short (minimum 50 words recommended)")

    # Score: start at 100, deduct per issue
    deduction_per_issue = 15
    score = max(0, 100 - len(issues) * deduction_per_issue)

    return {
        "compliant": len(issues) == 0,
        "score": score,
        "issues": issues,
        "word_count": word_count,
    }


async def get_compliance_score(db: AsyncSession) -> float:
    """Return the percentage of campaigns that have at least one APPROVED MLR script."""
    total_campaigns: int = (await db.execute(select(func.count(Campaign.id)))).scalar_one()
    if total_campaigns == 0:
        return 0.0

    compliant: int = (
        await db.execute(
            select(func.count(func.distinct(MLRScript.campaign_id))).where(
                MLRScript.status == MLRStatus.APPROVED
            )
        )
    ).scalar_one()

    return round(compliant / total_campaigns * 100, 2)
