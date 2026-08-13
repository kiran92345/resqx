"""
Smart Resource Distribution & Optimization Hub.

Uses PuLP (linear programming) to allocate limited resource stock across
competing incidents, maximizing total priority-weighted fulfillment
subject to per-resource stock constraints and per-incident demand caps.

Falls back to a deterministic greedy allocator if PuLP/CBC is not
available in the runtime, so the API never hard-fails.
"""
from typing import Dict, List
import math

try:
    import pulp
    PULP_AVAILABLE = True
except ImportError:  # pragma: no cover
    PULP_AVAILABLE = False


def _greedy_allocate(incidents: List[dict], stock: Dict[str, int]) -> Dict[str, Dict[str, int]]:
    """Fallback: allocate to highest-priority incidents first, resource by resource."""
    remaining = dict(stock)
    ordered = sorted(incidents, key=lambda i: i["priority_score"], reverse=True)
    result: Dict[str, Dict[str, int]] = {i["id"]: {} for i in incidents}
    for resource_type, available in remaining.items():
        pool = available
        for inc in ordered:
            demand = inc.get("demand", {}).get(resource_type, 0)
            give = min(demand, pool)
            if give > 0:
                result[inc["id"]][resource_type] = give
                pool -= give
    return result


def optimize_allocation(
    incidents: List[dict],
    stock: Dict[str, int],
) -> Dict[str, Dict[str, int]]:
    """
    incidents: [{ id, priority_score, demand: {resource_type: units_needed} }]
    stock: { resource_type: available_units }

    Returns { incident_id: { resource_type: units_allocated } }

    Objective: maximize sum(priority_score * fulfillment_ratio) across all
    incidents and resource types, i.e. weight fulfillment by urgency so
    critical zones are served first without fully starving lower-priority
    zones when slack stock exists.
    """
    if not incidents:
        return {}

    if not PULP_AVAILABLE:
        return _greedy_allocate(incidents, stock)

    resource_types = list(stock.keys())
    prob = pulp.LpProblem("ResQX_Resource_Allocation", pulp.LpMaximize)

    # Decision variables: units of resource r allocated to incident i
    x = {
        (inc["id"], r): pulp.LpVariable(
            f"x_{inc['id']}_{r}", lowBound=0,
            upBound=inc.get("demand", {}).get(r, 0), cat="Integer"
        )
        for inc in incidents for r in resource_types
    }

    # Objective: priority-weighted fulfillment, normalized by demand so no
    # single huge-demand incident dominates the objective unfairly.
    objective_terms = []
    for inc in incidents:
        weight = max(inc["priority_score"], 1.0)
        for r in resource_types:
            demand = inc.get("demand", {}).get(r, 0)
            if demand > 0:
                objective_terms.append((weight / math.sqrt(demand)) * x[(inc["id"], r)])
    prob += pulp.lpSum(objective_terms)

    # Constraint: total allocated per resource type <= available stock
    for r in resource_types:
        prob += pulp.lpSum(x[(inc["id"], r)] for inc in incidents) <= stock[r]

    prob.solve(pulp.PULP_CBC_CMD(msg=0))

    result: Dict[str, Dict[str, int]] = {inc["id"]: {} for inc in incidents}
    for inc in incidents:
        for r in resource_types:
            val = int(round(x[(inc["id"], r)].value() or 0))
            if val > 0:
                result[inc["id"]][r] = val
    return result


def estimate_eta_minutes(distance_km: float, disaster_type: str) -> int:
    """Rough ETA heuristic — average dispatch speed varies by terrain/conditions."""
    base_speed_kmh = {
        "flood": 30,
        "earthquake": 25,
        "fire": 35,
        "outbreak": 45,
        "other": 40,
    }.get(disaster_type, 40)
    minutes = (distance_km / base_speed_kmh) * 60
    return max(5, int(round(minutes)) + 10)  # +10 min dispatch prep buffer
