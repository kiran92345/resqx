import type { RequestStatus, Incident } from "../types";
import type { IndiaMapLocation, SeverityLevel } from "./indiaLocations";
import { INDIA_EMERGENCY_LOCATIONS } from "./indiaLocations";

export interface TrackableIncident {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: [number, number];
  severity: SeverityLevel;
  disaster_type: string;
  description: string;
  affected?: number;
  status: RequestStatus;
  etaMinutes: number;
  unitLabel: string;
  unitType: string;
  route: [number, number][];
  originLabel: string;
  solutionSteps: { label: string; done: boolean; time: string }[];
  progressPct: number;
}

function severityToStatus(severity: SeverityLevel): RequestStatus {
  if (severity === "critical") return "in_transit";
  if (severity === "high") return "dispatched";
  if (severity === "medium") return "in_review";
  return "resolved";
}

function severityToEta(severity: SeverityLevel): number {
  if (severity === "critical") return 4;
  if (severity === "high") return 9;
  if (severity === "medium") return 18;
  return 0;
}

function unitForDisaster(type?: string): { label: string; type: string } {
  const map: Record<string, { label: string; type: string }> = {
    flood: { label: "Rescue Boat RB-03", type: "🚤" },
    fire: { label: "Fire Engine F-07", type: "🚒" },
    accident: { label: "Ambulance A12", type: "🚑" },
    medical: { label: "Ambulance A12", type: "🚑" },
    earthquake: { label: "NDRF Squad N-02", type: "🚛" },
    other: { label: "Response Unit R-15", type: "🚑" },
  };
  return map[type ?? "other"] ?? map.other;
}

function nearestHospital(coords: [number, number]): IndiaMapLocation {
  const hospitals = INDIA_EMERGENCY_LOCATIONS.filter((l) => l.type === "hospital");
  let best = hospitals[0];
  let minDist = Infinity;
  for (const h of hospitals) {
    const d = (h.coordinates[0] - coords[0]) ** 2 + (h.coordinates[1] - coords[1]) ** 2;
    if (d < minDist) { minDist = d; best = h; }
  }
  return best;
}

export function buildRoute(from: [number, number], to: [number, number], points = 6): [number, number][] {
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    return [
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
    ] as [number, number];
  });
}

const STATUS_ORDER: RequestStatus[] = [
  "submitted", "in_review", "dispatched", "in_transit", "delivered", "resolved",
];

function buildSolutionSteps(status: RequestStatus): TrackableIncident["solutionSteps"] {
  const idx = STATUS_ORDER.indexOf(status);
  const steps = [
    { label: "Alert created", time: "09:30 AM" },
    { label: "AI analyzing emergency", time: "09:30 AM" },
    { label: "Verified & prioritized", time: "09:31 AM" },
    { label: "Resource assigned", time: "09:31 AM" },
    { label: "Responder accepted — on the way", time: "09:32 AM" },
    { label: "Arriving at scene", time: "09:34 AM" },
    { label: "Emergency resolved", time: "09:45 AM" },
  ];
  const mapped = Math.round((idx / (STATUS_ORDER.length - 1)) * (steps.length - 1));
  return steps.map((s, i) => ({ ...s, done: i <= mapped }));
}

function statusToProgress(status: RequestStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return Math.round((idx / (STATUS_ORDER.length - 1)) * 100);
}

export function fromMapLocation(loc: IndiaMapLocation): TrackableIncident {
  const hospital = nearestHospital(loc.coordinates);
  const status = loc.severity === "low" && loc.disaster_type === "fire" ? "resolved" : severityToStatus(loc.severity);
  const unit = unitForDisaster(loc.disaster_type);
  return {
    id: loc.id,
    name: loc.name,
    city: loc.city,
    state: loc.state,
    coordinates: loc.coordinates,
    severity: loc.severity,
    disaster_type: loc.disaster_type ?? "other",
    description: loc.description,
    affected: loc.affected,
    status,
    etaMinutes: severityToEta(loc.severity),
    unitLabel: unit.label,
    unitType: unit.type,
    route: buildRoute(hospital.coordinates, loc.coordinates),
    originLabel: hospital.name,
    solutionSteps: buildSolutionSteps(status),
    progressPct: statusToProgress(status),
  };
}

export function fromApiIncident(inc: Incident): TrackableIncident {
  const severity = inc.priority_level === "critical" ? "critical"
    : inc.priority_level === "high" ? "high"
    : inc.priority_level === "medium" ? "medium" : "low";
  const hospital = nearestHospital(inc.coordinates);
  const unit = unitForDisaster(inc.disaster_type);
  return {
    id: inc.id,
    name: inc.name,
    city: inc.name.split(",")[0] ?? "India",
    state: "India",
    coordinates: inc.coordinates,
    severity: severity as SeverityLevel,
    disaster_type: inc.disaster_type,
    description: `${inc.disaster_type} — ${inc.affected_count} affected`,
    affected: inc.affected_count,
    status: inc.status,
    etaMinutes: inc.status === "resolved" ? 0 : severityToEta(severity as SeverityLevel),
    unitLabel: unit.label,
    unitType: unit.type,
    route: buildRoute(hospital.coordinates, inc.coordinates),
    originLabel: hospital.name,
    solutionSteps: buildSolutionSteps(inc.status),
    progressPct: statusToProgress(inc.status),
  };
}

/** Mobile alert id → map location id */
export const ALERT_TO_INCIDENT: Record<string, string> = {
  "1": "in-hyd-2",
  "2": "in-hyd-1",
  "3": "in-hyd-5",
  "4": "in-hyd-3",
};

/** Admin recent alerts → map location id */
export const ADMIN_ALERT_TO_INCIDENT: Record<string, string> = {
  "1": "in-hyd-1",
  "2": "in-del-1",
  "3": "in-mum-2",
  "4": "in-che-1",
  "5": "in-koc-1",
  "6": "in-kol-2",
};

export function getTrackableById(id: string): TrackableIncident | null {
  const loc = INDIA_EMERGENCY_LOCATIONS.find((l) => l.id === id);
  if (loc) return fromMapLocation(loc);
  const mapped = ALERT_TO_INCIDENT[id] ?? ADMIN_ALERT_TO_INCIDENT[id];
  if (mapped) {
    const m = INDIA_EMERGENCY_LOCATIONS.find((l) => l.id === mapped);
    if (m) return fromMapLocation(m);
  }
  return null;
}
