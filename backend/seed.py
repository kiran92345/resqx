"""
Populates MongoDB with realistic mock data: 5+ disaster zones and resource
hubs, so the dashboard, map, and charts have something to render on first run.

Usage:
    python seed.py
"""
import asyncio
import uuid
from datetime import datetime

from app.database import incidents_collection, resources_collection
from app.services.scoring_engine import compute_priority_score

ZONES = [
    dict(name="Flood Zone Alpha", coordinates=[26.7606, 83.3732], disaster_type="flood",
         affected_count=1450, injured_count=38, children_count=210, elderly_count=95),
    dict(name="Urban Fire Cluster 4", coordinates=[19.0760, 72.8777], disaster_type="fire",
         affected_count=620, injured_count=54, children_count=70, elderly_count=40),
    dict(name="Outbreak Sector 9", coordinates=[13.0827, 80.2707], disaster_type="outbreak",
         affected_count=3100, injured_count=12, children_count=480, elderly_count=560),
    dict(name="Earthquake Ridge East", coordinates=[30.3165, 78.0322], disaster_type="earthquake",
         affected_count=2200, injured_count=310, children_count=340, elderly_count=180),
    dict(name="Coastal Flood Basin South", coordinates=[9.9312, 76.2673], disaster_type="flood",
         affected_count=980, injured_count=21, children_count=160, elderly_count=110),
    dict(name="Industrial Fire Belt", coordinates=[22.5726, 88.3639], disaster_type="fire",
         affected_count=340, injured_count=29, children_count=25, elderly_count=18),
]

HUBS = [
    dict(resource_type="food", available_units=850, reserved_units=120, location_hub="Central Warehouse"),
    dict(resource_type="water", available_units=1200, reserved_units=200, location_hub="Central Warehouse"),
    dict(resource_type="medical_kits", available_units=45, reserved_units=10, location_hub="Field Hospital A"),
    dict(resource_type="rescue_teams", available_units=18, reserved_units=4, location_hub="Ops HQ"),
    dict(resource_type="shelter_units", available_units=300, reserved_units=50, location_hub="Relief Camp North"),
    dict(resource_type="medical_kits", available_units=15, reserved_units=2, location_hub="Field Hospital B"),
]


async def seed():
    await incidents_collection.delete_many({})
    await resources_collection.delete_many({})

    for z in ZONES:
        score, level, shap = compute_priority_score(
            disaster_type=z["disaster_type"],
            affected_count=z["affected_count"],
            injured_count=z["injured_count"],
            children_count=z["children_count"],
            elderly_count=z["elderly_count"],
            nearby_resource_deficit_pct=30.0,
            existing_water_supply_available=False,
        )
        doc = {
            "_id": str(uuid.uuid4()),
            **z,
            "needs": {"food": True, "water": True, "medical": True, "shelter": True, "rescue_team": True},
            "priority_score": score,
            "priority_level": level,
            "shap_breakdown": [f.dict() for f in shap],
            "status": "submitted",
            "anomaly_flags": [],
            "timestamp": datetime.utcnow(),
            "reporter_name": None,
            "reporter_contact": None,
            "notes": None,
        }
        await incidents_collection.insert_one(doc)
        print(f"Seeded incident: {z['name']} — priority {score} ({level})")

    for h in HUBS:
        doc = {"_id": str(uuid.uuid4()), **h}
        await resources_collection.insert_one(doc)
        print(f"Seeded resource: {h['resource_type']} @ {h['location_hub']}")

    print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed())
