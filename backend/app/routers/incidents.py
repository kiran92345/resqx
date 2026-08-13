import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.database import incidents_collection, resources_collection
from app.schemas.incident import Incident, IncidentCreate, IncidentStatusUpdate, RequestStatus
from app.services.scoring_engine import compute_priority_score, detect_anomalies
from app.services.fraud_detection import check_fraud_and_duplicates
from app.services.ws_manager import manager
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


async def _resource_deficit_pct(near_coordinates: List[float]) -> float:
    """Rough proxy: % of resource types currently at < 20% of typical stock."""
    cursor = resources_collection.find({})
    types_seen, types_low = 0, 0
    async for r in cursor:
        types_seen += 1
        if r.get("available_units", 0) < 20:
            types_low += 1
    if types_seen == 0:
        return 0.0
    return (types_low / types_seen) * 100.0


@router.post("", response_model=Incident, status_code=201)
async def create_incident(payload: IncidentCreate):
    anomalies = detect_anomalies(
        payload.affected_count, payload.injured_count,
        payload.children_count, payload.elderly_count,
    )

    fraud_flags, needs_verification = await check_fraud_and_duplicates(
        incidents_collection,
        payload.coordinates,
        payload.disaster_type.value,
        payload.reporter_contact,
        payload.notes,
    )
    all_flags = list(set(anomalies + fraud_flags))

    deficit_pct = await _resource_deficit_pct(payload.coordinates)
    score, level, shap = compute_priority_score(
        disaster_type=payload.disaster_type.value,
        affected_count=payload.affected_count,
        injured_count=payload.injured_count,
        children_count=payload.children_count,
        elderly_count=payload.elderly_count,
        nearby_resource_deficit_pct=deficit_pct,
        existing_water_supply_available=payload.needs.water is False,
    )

    incident_id = str(uuid.uuid4())
    doc = {
        "_id": incident_id,
        "name": payload.name,
        "coordinates": payload.coordinates,
        "disaster_type": payload.disaster_type.value,
        "affected_count": payload.affected_count,
        "injured_count": payload.injured_count,
        "children_count": payload.children_count,
        "elderly_count": payload.elderly_count,
        "needs": payload.needs.dict(),
        "priority_score": score,
        "priority_level": level,
        "shap_breakdown": [f.dict() for f in shap],
        "status": RequestStatus.in_review.value if needs_verification else RequestStatus.submitted.value,
        "anomaly_flags": all_flags,
        "needs_verification": needs_verification,
        "timestamp": datetime.utcnow(),
        "reporter_name": payload.reporter_name,
        "reporter_contact": payload.reporter_contact,
        "notes": payload.notes,
    }
    await incidents_collection.insert_one(doc)

    out = Incident(id=incident_id, **{k: v for k, v in doc.items() if k != "_id"})
    await manager.broadcast("incident_created", out.dict())
    return out


@router.get("", response_model=List[Incident])
async def list_incidents(
    status_filter: Optional[RequestStatus] = Query(None, alias="status"),
    disaster_type: Optional[str] = None,
    sort_by_priority: bool = True,
):
    query = {}
    if status_filter:
        query["status"] = status_filter.value
    if disaster_type:
        query["disaster_type"] = disaster_type

    cursor = incidents_collection.find(query)
    if sort_by_priority:
        cursor = cursor.sort("priority_score", -1)

    results = []
    async for doc in cursor:
        doc_id = doc.pop("_id")
        results.append(Incident(id=doc_id, **doc))
    return results


@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str):
    doc = await incidents_collection.find_one({"_id": incident_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Incident not found")
    doc_id = doc.pop("_id")
    return Incident(id=doc_id, **doc)


@router.patch("/{incident_id}/status", response_model=Incident)
async def update_status(incident_id: str, payload: IncidentStatusUpdate):
    doc = await incidents_collection.find_one({"_id": incident_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Incident not found")

    await incidents_collection.update_one(
        {"_id": incident_id}, {"$set": {"status": payload.status.value}}
    )
    doc["status"] = payload.status.value
    doc_id = doc.pop("_id")
    out = Incident(id=doc_id, **doc)
    await manager.broadcast("status_updated", {"incident_id": incident_id, "status": payload.status.value})
    return out
