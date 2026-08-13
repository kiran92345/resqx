"""
Resource Inventory & Allocation Plan schemas.
"""
from enum import Enum
from typing import Dict, Optional
from pydantic import BaseModel, Field


class ResourceType(str, Enum):
    food = "food"
    water = "water"
    medical_kits = "medical_kits"
    rescue_teams = "rescue_teams"
    shelter_units = "shelter_units"


class ResourceInventoryCreate(BaseModel):
    resource_type: ResourceType
    available_units: int = Field(..., ge=0)
    reserved_units: int = Field(0, ge=0)
    location_hub: str


class ResourceInventory(ResourceInventoryCreate):
    id: str


class AssignedResources(BaseModel):
    food: int = 0
    water: int = 0
    medical_kits: int = 0
    rescue_teams: int = 0
    shelter_units: int = 0


class AllocationPlan(BaseModel):
    id: str
    incident_id: str
    assigned_resources: AssignedResources
    eta_minutes: Optional[int] = None
    status: str = "planned"  # planned | dispatched | in_transit | delivered
