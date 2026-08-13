"""
Dynamic Priority & Disaster Scoring Engine.

This is a transparent, rule-weighted scoring function (interpretable by
design, like a small gradient-boosted stump ensemble collapsed into closed
form) so that we can generate an honest SHAP-style additive breakdown
without needing an actual trained model + SHAP library at request time.
Swap `compute_priority_score` for a real sklearn/XGBoost model + real
`shap.TreeExplainer` in production; the output contract (score + ordered
list of signed contributions that sum to the score) stays the same.
"""
from typing import Dict, List, Tuple
from app.schemas.incident import DisasterType, ShapFactor

# Base weight per disaster type (reflects typical severity/urgency profile)
DISASTER_BASE_WEIGHT: Dict[str, float] = {
    DisasterType.earthquake.value: 30.0,
    DisasterType.fire.value: 26.0,
    DisasterType.flood.value: 22.0,
    DisasterType.outbreak.value: 24.0,
    DisasterType.other.value: 15.0,
}

MAX_SCORE = 100.0


def _clamp(value: float, lo: float = 0.0, hi: float = MAX_SCORE) -> float:
    return max(lo, min(hi, value))


def compute_priority_score(
    disaster_type: str,
    affected_count: int,
    injured_count: int,
    children_count: int,
    elderly_count: int,
    nearby_resource_deficit_pct: float,
    existing_water_supply_available: bool = False,
) -> Tuple[float, str, List[ShapFactor]]:
    """
    Returns (priority_score 0-100, priority_level, shap_breakdown).

    Each factor's contribution is expressed as a signed percentage of the
    final score, mirroring how a SHAP waterfall chart is typically shown
    to end users (base value + additive contributions -> final score).
    """
    factors: List[ShapFactor] = []

    base = DISASTER_BASE_WEIGHT.get(disaster_type, 15.0)
    factors.append(ShapFactor(
        label=f"Base severity — {disaster_type.replace('_', ' ').title()}",
        contribution_pct=round(base, 1),
        direction="increase",
    ))

    # Population / affected-count contribution (diminishing returns via log-ish scaling)
    pop_contribution = _clamp(affected_count / 25.0, 0, 20)
    factors.append(ShapFactor(
        label="Population Density & Affected Count",
        contribution_pct=round(pop_contribution, 1),
        direction="increase",
    ))

    # Critical injuries
    injury_contribution = _clamp(injured_count * 1.5, 0, 25)
    factors.append(ShapFactor(
        label="Critical Injuries",
        contribution_pct=round(injury_contribution, 1),
        direction="increase",
    ))

    # Vulnerable demographic (children + elderly)
    vulnerable = children_count + elderly_count
    vulnerable_contribution = _clamp(vulnerable * 1.2, 0, 20)
    if vulnerable_contribution > 0:
        factors.append(ShapFactor(
            label="Vulnerable Demographic (Children/Elderly)",
            contribution_pct=round(vulnerable_contribution, 1),
            direction="increase",
        ))

    # Existing resource deficit at/near this zone
    deficit_contribution = _clamp(nearby_resource_deficit_pct * 0.15, 0, 15)
    if deficit_contribution > 0:
        factors.append(ShapFactor(
            label="Existing Resource Deficit Nearby",
            contribution_pct=round(deficit_contribution, 1),
            direction="increase",
        ))

    # Mitigating factor: water supply already available nearby
    mitigation = -8.0 if existing_water_supply_available else 0.0
    if mitigation != 0:
        factors.append(ShapFactor(
            label="Nearby Water Supply Available",
            contribution_pct=mitigation,
            direction="decrease",
        ))

    raw_score = sum(f.contribution_pct for f in factors)
    score = round(_clamp(raw_score), 1)

    if score >= 75:
        level = "critical"
    elif score >= 50:
        level = "high"
    elif score >= 25:
        level = "medium"
    else:
        level = "low"

    # Sort factors by absolute contribution, descending, for a cleaner waterfall
    factors.sort(key=lambda f: abs(f.contribution_pct), reverse=True)

    return score, level, factors


def detect_anomalies(
    affected_count: int,
    injured_count: int,
    children_count: int,
    elderly_count: int,
) -> List[str]:
    """
    Guardrail checks flagging suspicious/impossible submissions before
    they reach the dispatch pipeline (used by the citizen intake form
    and the admin validation tool).
    """
    flags: List[str] = []
    if injured_count > affected_count:
        flags.append("Injured count exceeds total affected count")
    if (children_count + elderly_count) > affected_count:
        flags.append("Children + elderly count exceeds total affected count")
    if affected_count > 50000:
        flags.append("Affected count unusually high — please verify")
    if affected_count == 0:
        flags.append("Affected count is zero — request may be a test/error")
    return flags
