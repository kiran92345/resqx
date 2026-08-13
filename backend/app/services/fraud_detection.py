"""Fraud and duplicate detection for emergency reports."""
from typing import List, Tuple, Optional
import math


def _distance_km(a: List[float], b: List[float]) -> float:
    lat1, lon1 = a[0], a[1]
    lat2, lon2 = b[0], b[1]
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    x = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(x))


async def check_fraud_and_duplicates(
    incidents_collection,
    coordinates: List[float],
    disaster_type: str,
    reporter_contact: Optional[str],
    notes: Optional[str],
) -> Tuple[List[str], bool]:
    """
    Returns (anomaly_flags, needs_verification).
    Genuine emergencies are never auto-rejected — flagged for operator review.
    """
    flags: List[str] = []
    needs_verification = False

    query = {"disaster_type": disaster_type, "status": {"$ne": "resolved"}}
    async for doc in incidents_collection.find(query).limit(50):
        other_coords = doc.get("coordinates", [0, 0])
        if _distance_km(coordinates, other_coords) < 0.5:
            flags.append("duplicate: nearby active report within 500m")
            needs_verification = True
            break

    if reporter_contact:
        count = await incidents_collection.count_documents({
            "reporter_contact": reporter_contact,
            "status": {"$ne": "resolved"},
        })
        if count >= 3:
            flags.append("suspicious: repeated requests from same source")
            needs_verification = True

    if notes and len(notes) < 5:
        flags.append("verification: minimal description provided")

    return flags, needs_verification
