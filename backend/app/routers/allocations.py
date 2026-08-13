import math
import uuid
from typing import List

from fastapi import APIRouter, HTTPException

from app.database import incidents_collection, resources_collection, allocations_collection
from app.schemas.resource import AllocationPlan, AssignedResources
from app.services.optimizer import optimize_allocation, estimate_eta_minutes
from app.services.ws_manager import manager

router = APIRouter(prefix="/api/allocations", tags=["allocations"])

# 1 unit of "affected count" translates to demand this way (tunable):
DEMAND_PER_AFFECTED = {
    "food": 1.0,
    "water": 1.5,
    "medical_kits": 0.15,
    "rescue_teams": 0.02,
    "shelter_units": 0.3,
}


def _haversine_km(a: List[float], b: List[float]) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


@router.post("/optimize", response_model=List[AllocationPlan])
async def run_optimization():
    """
    Pulls all open (non-resolved) incidents + current stock, runs the LP
    solver, and persists an AllocationPlan per incident with an ETA.
    """
    incidents_cursor = incidents_collection.find({"status": {"$ne": "resolved"}})
    incidents = []
    async for doc in incidents_cursor:
        demand = {
            rtype: int(round(doc["affected_count"] * factor))
            for rtype, factor in DEMAND_PER_AFFECTED.items()
        }
        incidents.append({
            "id": doc["_id"],
            "priority_score": doc["priority_score"],
            "coordinates": doc["coordinates"],
            "demand": demand,
        })

    if not incidents:
        return []

    stock: dict = {}
    hub_locations: dict = {}
    async for r in resources_collection.find({}):
        stock[r["resource_type"]] = stock.get(r["resource_type"], 0) + r["available_units"]
        hub_locations.setdefault(r["resource_type"], r.get("hub_coordinates", [0, 0]))

    allocation_map = optimize_allocation(incidents, stock)

    plans: List[AllocationPlan] = []
    for inc in incidents:
        assigned_raw = allocation_map.get(inc["id"], {})
        assigned = AssignedResources(**{k: assigned_raw.get(k, 0) for k in AssignedResources().dict()})

        hub_coords = hub_locations.get("food", inc["coordinates"])
        distance = _haversine_km(inc["coordinates"], hub_coords) if hub_coords else 5.0
        eta = estimate_eta_minutes(distance, "other")

        plan_id = str(uuid.uuid4())
        doc = {
            "_id": plan_id,
            "incident_id": inc["id"],
            "assigned_resources": assigned.dict(),
            "eta_minutes": eta,
            "status": "planned",
        }
        await allocations_collection.update_one(
            {"incident_id": inc["id"]}, {"$set": doc}, upsert=True
        )
        plans.append(AllocationPlan(id=plan_id, **{k: v for k, v in doc.items() if k != "_id"}))

    await manager.broadcast("allocation_updated", {"count": len(plans)})
    return plans


@router.get("", response_model=List[AllocationPlan])
async def list_allocations():
    results = []
    async for doc in allocations_collection.find({}):
        doc_id = doc.pop("_id")
        results.append(AllocationPlan(id=doc_id, **doc))
    return results


@router.get("/incident/{incident_id}", response_model=AllocationPlan)
async def get_allocation_for_incident(incident_id: str):
    doc = await allocations_collection.find_one({"incident_id": incident_id})
    if not doc:
        raise HTTPException(status_code=404, detail="No allocation plan yet for this incident")
    doc_id = doc.pop("_id")
    return AllocationPlan(id=doc_id, **doc)
