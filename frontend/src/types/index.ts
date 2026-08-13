export type DisasterType = "flood" | "fire" | "earthquake" | "outbreak" | "other";

export type RequestStatus =
  | "submitted"
  | "in_review"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "resolved";

export type PriorityLevel = "critical" | "high" | "medium" | "low";

export interface NeedsRequested {
  food: boolean;
  water: boolean;
  medical: boolean;
  shelter: boolean;
  rescue_team: boolean;
}

export interface ShapFactor {
  label: string;
  contribution_pct: number;
  direction: "increase" | "decrease";
}

export interface Incident {
  id: string;
  name: string;
  coordinates: [number, number];
  disaster_type: DisasterType;
  affected_count: number;
  injured_count: number;
  children_count: number;
  elderly_count: number;
  needs: NeedsRequested;
  priority_score: number;
  priority_level: PriorityLevel;
  shap_breakdown: ShapFactor[];
  status: RequestStatus;
  anomaly_flags: string[];
  timestamp: string;
}

export interface ResourceInventory {
  id: string;
  resource_type: "food" | "water" | "medical_kits" | "rescue_teams" | "shelter_units";
  available_units: number;
  reserved_units: number;
  location_hub: string;
}

export interface AssignedResources {
  food: number;
  water: number;
  medical_kits: number;
  rescue_teams: number;
  shelter_units: number;
}

export interface AllocationPlan {
  id: string;
  incident_id: string;
  assigned_resources: AssignedResources;
  eta_minutes: number | null;
  status: string;
}

export interface KPIs {
  active_disasters: number;
  total_critical_alerts: number;
  assigned_rescue_teams: number;
  resource_fulfillment_rate_pct: number;
}

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
