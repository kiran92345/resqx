from fastapi import APIRouter

from app.database import incidents_collection, resources_collection, allocations_collection

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/kpis")
async def get_kpis():
    active_disasters = await incidents_collection.count_documents({"status": {"$ne": "resolved"}})
    critical_alerts = await incidents_collection.count_documents({"priority_level": "critical"})

    assigned_teams = 0
    async for a in allocations_collection.find({}):
        assigned_teams += a.get("assigned_resources", {}).get("rescue_teams", 0)

    total_demand, total_fulfilled = 0, 0
    async for inc in incidents_collection.find({}):
        total_demand += inc.get("affected_count", 0)
    async for a in allocations_collection.find({}):
        total_fulfilled += sum(a.get("assigned_resources", {}).values())

    fulfillment_rate = round((total_fulfilled / total_demand) * 100, 1) if total_demand else 0.0

    return {
        "active_disasters": active_disasters,
        "total_critical_alerts": critical_alerts,
        "assigned_rescue_teams": assigned_teams,
        "resource_fulfillment_rate_pct": fulfillment_rate,
    }


@router.get("/priority-trend")
async def priority_trend():
    """Priority score distribution across active incidents, bucketed by disaster type."""
    buckets: dict = {}
    async for inc in incidents_collection.find({"status": {"$ne": "resolved"}}):
        dtype = inc["disaster_type"]
        buckets.setdefault(dtype, []).append(inc["priority_score"])

    return [
        {"disaster_type": dtype, "avg_priority": round(sum(scores) / len(scores), 1), "count": len(scores)}
        for dtype, scores in buckets.items()
    ]


@router.get("/resource-supply-demand")
async def resource_supply_demand():
    supply: dict = {}
    async for r in resources_collection.find({}):
        supply[r["resource_type"]] = supply.get(r["resource_type"], 0) + r["available_units"]

    demand: dict = {}
    async for a in allocations_collection.find({}):
        for rtype, units in a.get("assigned_resources", {}).items():
            demand[rtype] = demand.get(rtype, 0) + units

    resource_types = set(list(supply.keys()) + list(demand.keys()))
    return [
        {"resource_type": rt, "supply": supply.get(rt, 0), "demand": demand.get(rt, 0)}
        for rt in resource_types
    ]
