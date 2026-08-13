import type { EmergencyCategoryId } from "../data/mockDashboard";
import type { Incident, RequestStatus, PriorityLevel, DisasterType } from "../types";
import * as apiClient from "../api/client";
import { addUserIncident, getUserIncidentIds } from "./userIncidents";

export interface UserEmergencyRecord {
  id: string;
  category: EmergencyCategoryId;
  location: string;
  coordinates: [number, number];
  description: string;
  disaster_type: DisasterType;
  status: RequestStatus;
  priority_level: PriorityLevel;
  timestamp: string;
}

const STORAGE_KEY = "resqx_user_emergencies";

const DISASTER: Record<EmergencyCategoryId, DisasterType> = {
  medical: "outbreak",
  fire: "fire",
  accident: "other",
  flood: "flood",
  crime: "other",
  other: "other",
};

const PRIORITY: Record<EmergencyCategoryId, PriorityLevel> = {
  medical: "critical",
  fire: "critical",
  accident: "critical",
  flood: "high",
  crime: "high",
  other: "medium",
};

export function getStoredEmergencies(): UserEmergencyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStored(records: UserEmergencyRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getStoredEmergency(id: string): UserEmergencyRecord | null {
  return getStoredEmergencies().find((r) => r.id === id) ?? null;
}

export function registerUserEmergency(
  partial: Omit<UserEmergencyRecord, "disaster_type" | "status" | "priority_level" | "timestamp"> & {
    disaster_type?: DisasterType;
    status?: RequestStatus;
    priority_level?: PriorityLevel;
    timestamp?: string;
  }
): UserEmergencyRecord {
  const record: UserEmergencyRecord = {
    ...partial,
    disaster_type: partial.disaster_type ?? DISASTER[partial.category],
    status: partial.status ?? "submitted",
    priority_level: partial.priority_level ?? PRIORITY[partial.category],
    timestamp: partial.timestamp ?? new Date().toISOString(),
  };
  const existing = getStoredEmergencies().filter((r) => r.id !== record.id);
  saveStored([record, ...existing]);
  addUserIncident(record.id);
  return record;
}

export function registerFromApiIncident(inc: Incident, category: EmergencyCategoryId = "other"): UserEmergencyRecord {
  return registerUserEmergency({
    id: inc.id,
    category,
    location: inc.name,
    coordinates: inc.coordinates as [number, number],
    description: inc.name,
    disaster_type: inc.disaster_type,
    status: inc.status,
    priority_level: inc.priority_level,
    timestamp: inc.timestamp,
  });
}

export function registerFromOffline(
  localId: string,
  entry: {
    category: EmergencyCategoryId;
    location: string;
    coordinates: [number, number];
    description: string;
  }
): UserEmergencyRecord {
  return registerUserEmergency({ id: localId, ...entry });
}

export function migrateIncidentId(oldId: string, newId: string) {
  const records = getStoredEmergencies();
  const idx = records.findIndex((r) => r.id === oldId);
  if (idx >= 0) {
    records[idx] = { ...records[idx], id: newId };
    saveStored(records);
  }
  const ids = getUserIncidentIds().map((id) => (id === oldId ? newId : id));
  localStorage.setItem("resqx_my_incidents", JSON.stringify([...new Set(ids)]));
  if (localStorage.getItem("resqx_last_incident") === oldId) {
    localStorage.setItem("resqx_last_incident", newId);
  }
}

export function storedToIncident(record: UserEmergencyRecord): Incident {
  return {
    id: record.id,
    name: record.location.split(",")[0] || "Emergency",
    coordinates: record.coordinates,
    disaster_type: record.disaster_type,
    affected_count: 1,
    injured_count: record.category === "medical" ? 1 : 0,
    children_count: 0,
    elderly_count: 0,
    needs: {
      food: false,
      water: false,
      medical: record.category === "medical",
      shelter: record.category === "flood",
      rescue_team: true,
    },
    priority_score: record.priority_level === "critical" ? 90 : 70,
    priority_level: record.priority_level,
    shap_breakdown: [],
    status: record.status,
    anomaly_flags: [],
    timestamp: record.timestamp,
  };
}

export async function resolveUserIncident(id: string): Promise<Incident | null> {
  const local = getStoredEmergency(id);
  if (id.startsWith("offline-") || id.startsWith("local-")) {
    return local ? storedToIncident(local) : null;
  }
  try {
    const inc = await apiClient.fetchIncident(id);
    if (local) {
      registerFromApiIncident(inc, local.category);
    }
    return inc;
  } catch {
    return local ? storedToIncident(local) : null;
  }
}

export function getAllUserIncidents(): Incident[] {
  const ids = new Set(getUserIncidentIds());
  const last = localStorage.getItem("resqx_last_incident");
  if (last) ids.add(last);
  return getStoredEmergencies()
    .filter((r) => ids.has(r.id))
    .map(storedToIncident)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
