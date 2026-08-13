import uuid
from typing import List

from fastapi import APIRouter, HTTPException

from app.database import resources_collection
from app.schemas.resource import ResourceInventory, ResourceInventoryCreate
from app.services.ws_manager import manager

router = APIRouter(prefix="/api/resources", tags=["resources"])

LOW_STOCK_THRESHOLD = 20


@router.post("", response_model=ResourceInventory, status_code=201)
async def create_resource(payload: ResourceInventoryCreate):
    resource_id = str(uuid.uuid4())
    doc = {"_id": resource_id, **payload.dict()}
    await resources_collection.insert_one(doc)
    return ResourceInventory(id=resource_id, **payload.dict())


@router.get("", response_model=List[ResourceInventory])
async def list_resources(location_hub: str | None = None):
    query = {"location_hub": location_hub} if location_hub else {}
    results = []
    async for doc in resources_collection.find(query):
        doc_id = doc.pop("_id")
        results.append(ResourceInventory(id=doc_id, **doc))
    return results


@router.patch("/{resource_id}/stock", response_model=ResourceInventory)
async def adjust_stock(resource_id: str, delta_available: int = 0, delta_reserved: int = 0):
    doc = await resources_collection.find_one({"_id": resource_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")

    new_available = max(0, doc["available_units"] + delta_available)
    new_reserved = max(0, doc["reserved_units"] + delta_reserved)

    await resources_collection.update_one(
        {"_id": resource_id},
        {"$set": {"available_units": new_available, "reserved_units": new_reserved}},
    )
    doc["available_units"] = new_available
    doc["reserved_units"] = new_reserved

    if new_available < LOW_STOCK_THRESHOLD:
        await manager.broadcast("stock_alert", {
            "resource_id": resource_id,
            "resource_type": doc["resource_type"],
            "location_hub": doc["location_hub"],
            "available_units": new_available,
            "message": f"{doc['resource_type']} running low at {doc['location_hub']}",
        })

    doc_id = doc.pop("_id")
    return ResourceInventory(id=doc_id, **doc)
