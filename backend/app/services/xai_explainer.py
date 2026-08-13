"""
Natural-language explainability layer for the transparent priority scoring model.

Generates human-readable audit trails from SHAP-style factor breakdowns — no
external LLM required. Officers can review exactly why each incident received
its priority classification.
"""
from typing import Any, Dict, List


def _needs_summary(needs: Dict[str, bool]) -> List[str]:
    labels = {
        "food": "food supplies",
        "water": "clean water",
        "medical": "medical kits",
        "shelter": "emergency shelter",
        "rescue_team": "rescue teams",
    }
    return [labels[k] for k, v in needs.items() if v]


def explain_incident(incident: Dict[str, Any]) -> Dict[str, Any]:
    """Build a structured natural-language explanation for one incident."""
    score = incident.get("priority_score", 0)
    level = incident.get("priority_level", "medium")
    disaster = str(incident.get("disaster_type", "other")).replace("_", " ")
    name = incident.get("name", "Unknown zone")
    affected = incident.get("affected_count", 0)
    injured = incident.get("injured_count", 0)
    children = incident.get("children_count", 0)
    elderly = incident.get("elderly_count", 0)
    status = str(incident.get("status", "submitted")).replace("_", " ")
    factors: List[Dict] = incident.get("shap_breakdown") or []
    anomalies: List[str] = incident.get("anomaly_flags") or []
    needs = incident.get("needs") or {}

    increases = [f for f in factors if f.get("direction") == "increase"]
    decreases = [f for f in factors if f.get("direction") == "decrease"]
    top_increase = increases[0] if increases else None

    summary = (
        f"{name} is classified as {level} priority ({score}/100) due to a "
        f"{disaster} event affecting {affected:,} people, including "
        f"{injured} reported injuries and {children + elderly} vulnerable "
        f"individuals (children/elderly)."
    )

    reasoning_steps: List[str] = []
    for i, f in enumerate(factors, 1):
        sign = "+" if f.get("direction") == "increase" else ""
        pct = f.get("contribution_pct", 0)
        reasoning_steps.append(
            f"Step {i}: {f.get('label')} → {sign}{pct} points "
            f"({'raises' if f.get('direction') == 'increase' else 'lowers'} urgency)."
        )

    if top_increase:
        primary = (
            f"The dominant driver is \"{top_increase.get('label')}\" "
            f"(+{top_increase.get('contribution_pct')} pts), which heavily "
            f"influenced the {level} classification."
        )
    else:
        primary = "No single factor dominated; score reflects combined baseline severity."

    requested = _needs_summary(needs)
    if requested:
        needs_line = f"Requested resources: {', '.join(requested)}."
    else:
        needs_line = "No specific resource requests were flagged."

    if level in ("critical", "high"):
        dispatch = (
            f"Recommend immediate dispatch — escalate to active response. "
            f"Current status: {status}. Prioritize nearest available units."
        )
    elif level == "medium":
        dispatch = (
            f"Schedule staged response within standard SLA. "
            f"Monitor for escalation triggers. Status: {status}."
        )
    else:
        dispatch = (
            f"Low urgency — maintain monitoring and pre-position resources if deficit persists. "
            f"Status: {status}."
        )

    risk_factors = [f["label"] for f in increases if f.get("contribution_pct", 0) >= 10]
    mitigating_factors = [f["label"] for f in decreases]

    confidence = 92.0
    if anomalies:
        confidence -= min(25, len(anomalies) * 8)
    confidence = max(55.0, round(confidence, 1))

    return {
        "summary": summary,
        "primary_driver": primary,
        "reasoning_steps": reasoning_steps,
        "dispatch_recommendation": dispatch,
        "needs_summary": needs_line,
        "risk_factors": risk_factors,
        "mitigating_factors": mitigating_factors,
        "confidence_pct": confidence,
        "anomaly_warnings": anomalies,
    }


def aggregate_feature_importance(incidents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Average absolute SHAP contribution per feature label across all incidents."""
    totals: Dict[str, List[float]] = {}
    for inc in incidents:
        for f in inc.get("shap_breakdown") or []:
            label = f.get("label", "Unknown")
            totals.setdefault(label, []).append(abs(f.get("contribution_pct", 0)))

    aggregated = [
        {
            "label": label,
            "avg_contribution": round(sum(vals) / len(vals), 1),
            "incident_count": len(vals),
        }
        for label, vals in totals.items()
    ]
    aggregated.sort(key=lambda x: x["avg_contribution"], reverse=True)
    return aggregated
