"""
Location Incident schema — matches spec:
{ id, name, coordinates: [lat, lng], disasterType, affectedCount,
  injuredCount, childrenCount, priorityScore, status, timestamp }
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class DisasterType(str, Enum):
    flood = "flood"
    fire = "fire"
    earthquake = "earthquake"
    outbreak = "outbreak"
    other = "other"


class RequestStatus(str, Enum):
    submitted = "submitted"
    in_review = "in_review"
    dispatched = "dispatched"
    in_transit = "in_transit"
    delivered = "delivered"
    resolved = "resolved"


class NeedsRequested(BaseModel):
    food: bool = False
    water: bool = False
    medical: bool = False
    shelter: bool = False
    rescue_team: bool = False


class IncidentCreate(BaseModel):
    name: str
    coordinates: List[float] = Field(..., min_length=2, max_length=2)
    disaster_type: DisasterType
    affected_count: int = Field(..., ge=0)
    injured_count: int = Field(..., ge=0)
    children_count: int = Field(0, ge=0)
    elderly_count: int = Field(0, ge=0)
    needs: NeedsRequested = NeedsRequested()
    reporter_name: Optional[str] = None
    reporter_contact: Optional[str] = None
    notes: Optional[str] = None


class ShapFactor(BaseModel):
    label: str
    contribution_pct: float  # e.g. +35.0 or -10.0
    direction: str  # "increase" | "decrease"


class Incident(BaseModel):
    id: str
    name: str
    coordinates: List[float]
    disaster_type: DisasterType
    affected_count: int
    injured_count: int
    children_count: int
    elderly_count: int = 0
    needs: NeedsRequested = NeedsRequested()
    priority_score: float
    priority_level: str  # "critical" | "high" | "medium" | "low"
    shap_breakdown: List[ShapFactor] = []
    status: RequestStatus = RequestStatus.submitted
    anomaly_flags: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True


class IncidentStatusUpdate(BaseModel):
    status: RequestStatus
