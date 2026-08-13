from typing import List, Optional

from fastapi import APIRouter, HTTPException

from app.database import incidents_collection
from app.schemas.incident import Incident
from app.services.xai_explainer import aggregate_feature_importance, explain_incident

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/xai")
async def get_xai_analytics(
    disaster_type: Optional[str] = None,
    priority_level: Optional[str] = None,
):
    """Full explainable-AI analytics bundle for all incidents."""
    query = {}
    if disaster_type:
        query["disaster_type"] = disaster_type
    if priority_level:
        query["priority_level"] = priority_level

    raw: List[dict] = []
    cursor = incidents_collection.find(query).sort("priority_score", -1)
    async for doc in cursor:
        doc_id = doc.pop("_id")
        raw.append({"id": doc_id, **doc})

    explained = []
    for doc in raw:
        inc = Incident(id=doc["id"], **{k: v for k, v in doc.items() if k != "id"})
        explained.append({
            **inc.dict(),
            "explanation": explain_incident(inc.dict()),
        })

    scores = [d["priority_score"] for d in explained]
    critical = sum(1 for d in explained if d.get("priority_level") == "critical")
    anomalies = sum(1 for d in explained if d.get("anomaly_flags"))

    return {
        "model_version": "1.0.0",
        "model_type": "Transparent Weighted Feature Model (SHAP-compatible)",
        "methodology": (
            "Additive scoring from disaster base weight, population impact, "
            "injuries, vulnerable demographics, and resource deficit. "
            "Each factor's signed contribution is exposed for audit."
        ),
        "incidents": explained,
        "aggregate_features": aggregate_feature_importance(explained),
        "stats": {
            "total": len(explained),
            "critical": critical,
            "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "anomalies": anomalies,
        },
    }


@router.get("/xai/{incident_id}")
async def explain_single_incident(incident_id: str):
    """Detailed XAI explanation for one incident."""
    doc = await incidents_collection.find_one({"_id": incident_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Incident not found")
    doc_id = doc.pop("_id")
    inc = Incident(id=doc_id, **doc)
    return {
        "incident": inc.dict(),
        "explanation": explain_incident(inc.dict()),
    }
