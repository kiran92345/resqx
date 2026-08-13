/** India map defaults */
export const INDIA_CENTER: [number, number] = [22.5937, 78.9629];
export const INDIA_ZOOM = 5;
export const HYDERABAD_CENTER: [number, number] = [17.385, 78.4867];
export const HYDERABAD_ZOOM = 13;

export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type LocationType = "incident" | "hospital" | "shelter" | "resource" | "vehicle";

export interface IndiaMapLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: [number, number];
  severity: SeverityLevel;
  type: LocationType;
  disaster_type?: string;
  description: string;
  affected?: number;
}

/** Severity → marker color (green / orange / red) */
export const SEVERITY_COLOR: Record<SeverityLevel, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
  critical: "#DC2626",
};

export const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  low: "Low — Stable",
  medium: "Medium — Monitor",
  high: "High — Active Response",
  critical: "Critical — Immediate Action",
};

export function priorityToSeverity(level: string): SeverityLevel {
  if (level === "critical") return "critical";
  if (level === "high") return "high";
  if (level === "medium") return "medium";
  return "low";
}

/** Real Indian emergency & resource locations with accurate coordinates */
export const INDIA_EMERGENCY_LOCATIONS: IndiaMapLocation[] = [
  // ── Telangana (Hyderabad) ──
  {
    id: "in-hyd-1",
    name: "Heavy Flood — Hitech City",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.4435, 78.3772],
    severity: "high",
    type: "incident",
    disaster_type: "flood",
    description: "Waterlogging on ORR service road, 120 families affected",
    affected: 120,
  },
  {
    id: "in-hyd-2",
    name: "Road Accident — NH-44 Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.4156, 78.4347],
    severity: "high",
    type: "incident",
    disaster_type: "accident",
    description: "Multi-vehicle collision, 3 injured",
    affected: 3,
  },
  {
    id: "in-hyd-3",
    name: "Gas Leak — Secunderabad",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.4399, 78.4983],
    severity: "medium",
    type: "incident",
    disaster_type: "other",
    description: "Pipeline rupture near Paradise junction, evacuation zone 200m",
    affected: 45,
  },
  {
    id: "in-hyd-4",
    name: "Medical Emergency — Charminar",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.3616, 78.4747],
    severity: "medium",
    type: "incident",
    disaster_type: "medical",
    description: "Cardiac arrest cluster alert, ambulance dispatched",
    affected: 1,
  },
  {
    id: "in-hyd-5",
    name: "Fire Outbreak — Industrial Area",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.3689, 78.5249],
    severity: "low",
    type: "incident",
    disaster_type: "fire",
    description: "Warehouse fire contained, air quality normal",
    affected: 0,
  },
  {
    id: "in-hyd-h1",
    name: "Apollo Hospitals Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.4215, 78.4077],
    severity: "low",
    type: "hospital",
    description: "24/7 Trauma & Emergency — 150 beds available",
  },
  {
    id: "in-hyd-h2",
    name: "Gandhi Hospital",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.4062, 78.4847],
    severity: "low",
    type: "hospital",
    description: "Government tertiary care — emergency wing active",
  },
  {
    id: "in-hyd-s1",
    name: "Nampally Relief Shelter",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.3924, 78.4679],
    severity: "low",
    type: "shelter",
    description: "Capacity 500 — food & water available",
  },
  {
    id: "in-hyd-v1",
    name: "Ambulance A12",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.418, 78.442],
    severity: "medium",
    type: "vehicle",
    description: "En route — Banjara Hills",
  },
  {
    id: "in-hyd-r1",
    name: "Telangana State Disaster Depot",
    city: "Hyderabad",
    state: "Telangana",
    coordinates: [17.4065, 78.4692],
    severity: "low",
    type: "resource",
    description: "NDRF supplies, boats, medical kits",
  },

  // ── Delhi NCR ──
  {
    id: "in-del-1",
    name: "Earthquake Aftershock — North Delhi",
    city: "New Delhi",
    state: "Delhi",
    coordinates: [28.7041, 77.1025],
    severity: "critical",
    type: "incident",
    disaster_type: "earthquake",
    description: "M3.8 aftershock, structural damage in Sadar Bazar",
    affected: 340,
  },
  {
    id: "in-del-2",
    name: "Heavy Smog Alert — Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    coordinates: [28.6315, 77.2167],
    severity: "medium",
    type: "incident",
    disaster_type: "other",
    description: "AQI 412 — vulnerable groups advised indoors",
    affected: 5000,
  },
  {
    id: "in-del-h1",
    name: "AIIMS Trauma Center",
    city: "New Delhi",
    state: "Delhi",
    coordinates: [28.5672, 77.21],
    severity: "low",
    type: "hospital",
    description: "National emergency referral center",
  },

  // ── Maharashtra (Mumbai) ──
  {
    id: "in-mum-1",
    name: "Coastal Flood — Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    coordinates: [19.1136, 72.8697],
    severity: "high",
    type: "incident",
    disaster_type: "flood",
    description: "High tide flooding, local trains suspended",
    affected: 890,
  },
  {
    id: "in-mum-2",
    name: "Building Collapse — Bandra",
    city: "Mumbai",
    state: "Maharashtra",
    coordinates: [19.0596, 72.8295],
    severity: "critical",
    type: "incident",
    disaster_type: "other",
    description: "Partial collapse, NDRF teams on site",
    affected: 28,
  },
  {
    id: "in-mum-h1",
    name: "KEM Hospital Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    coordinates: [19.0047, 72.842],
    severity: "low",
    type: "hospital",
    description: "Major municipal emergency hospital",
  },

  // ── Karnataka (Bengaluru) ──
  {
    id: "in-blr-1",
    name: "Tech Park Fire — Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    coordinates: [12.9698, 77.75],
    severity: "medium",
    type: "incident",
    disaster_type: "fire",
    description: "Server room fire extinguished, no casualties",
    affected: 0,
  },
  {
    id: "in-blr-2",
    name: "Water Crisis — MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    coordinates: [12.9758, 77.6064],
    severity: "low",
    type: "incident",
    disaster_type: "other",
    description: "Supply disruption, tankers deployed",
    affected: 200,
  },

  // ── Tamil Nadu (Chennai) ──
  {
    id: "in-che-1",
    name: "Cyclone Warning — Marina Beach",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [13.05, 80.2824],
    severity: "high",
    type: "incident",
    disaster_type: "flood",
    description: "Cyclone Michaung residual — coastal evacuation",
    affected: 1200,
  },
  {
    id: "in-che-h1",
    name: "Rajiv Gandhi Govt General Hospital",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [13.0827, 80.2707],
    severity: "low",
    type: "hospital",
    description: "State emergency hospital — 24/7",
  },

  // ── West Bengal (Kolkata) ──
  {
    id: "in-kol-1",
    name: "Landslide Risk — Hill Area Darjeeling",
    city: "Darjeeling",
    state: "West Bengal",
    coordinates: [27.041, 88.2663],
    severity: "high",
    type: "incident",
    disaster_type: "other",
    description: "Heavy rainfall — road blocked NH-110",
    affected: 150,
  },
  {
    id: "in-kol-2",
    name: "Medical Camp — Park Street",
    city: "Kolkata",
    state: "West Bengal",
    coordinates: [22.5512, 88.3535],
    severity: "low",
    type: "incident",
    disaster_type: "medical",
    description: "Disease outbreak monitoring — stable",
    affected: 12,
  },

  // ── Gujarat ──
  {
    id: "in-ahm-1",
    name: "Industrial Fire — Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    coordinates: [23.0225, 72.5714],
    severity: "medium",
    type: "incident",
    disaster_type: "fire",
    description: "Chemical plant fire under control",
    affected: 8,
  },

  // ── Kerala ──
  {
    id: "in-koc-1",
    name: "Flash Flood — Kochi",
    city: "Kochi",
    state: "Kerala",
    coordinates: [9.9312, 76.2673],
    severity: "high",
    type: "incident",
    disaster_type: "flood",
    description: "Periyar river overflow — rescue boats active",
    affected: 650,
  },
];

/** Hyderabad live-tracking route: Apollo Hospital → Banjara Hills */
export const HYDERABAD_TRACKING_ROUTE: [number, number][] = [
  [17.4215, 78.4077],
  [17.4198, 78.4145],
  [17.4182, 78.421],
  [17.4168, 78.4275],
  [17.4156, 78.4347],
];

export const HYDERABAD_USER_LOCATION: [number, number] = [17.4156, 78.4347];

export const INDIA_RISK_AREAS = [
  { rank: 1, name: "North Delhi Zone", risk: 92, state: "Delhi" },
  { rank: 2, name: "Mumbai Coastal Belt", risk: 88, state: "Maharashtra" },
  { rank: 3, name: "Darjeeling Hill Area", risk: 85, state: "West Bengal" },
  { rank: 4, name: "Hyderabad IT Corridor", risk: 78, state: "Telangana" },
  { rank: 5, name: "Chennai Marina Zone", risk: 71, state: "Tamil Nadu" },
];

export const INDIA_ALERTS = [
  { id: "1", title: "Flood in Hitech City, Hyderabad", severity: "High" as const, time: "2 min ago" },
  { id: "2", title: "Earthquake aftershock — North Delhi", severity: "High" as const, time: "8 min ago" },
  { id: "3", title: "Building collapse — Bandra, Mumbai", severity: "High" as const, time: "12 min ago" },
  { id: "4", title: "Cyclone residual — Chennai Marina", severity: "Medium" as const, time: "15 min ago" },
  { id: "5", title: "Flash flood — Kochi, Kerala", severity: "Medium" as const, time: "18 min ago" },
  { id: "6", title: "Medical camp stable — Kolkata", severity: "Low" as const, time: "22 min ago" },
];

export const INDIA_MOBILE_ALERTS = [
  { id: "1", title: "Road Accident", time: "10:30 AM", description: "NH-44, Banjara Hills, Hyderabad — 3 injured", icon: "accident", color: "red" },
  { id: "2", title: "Heavy Flood", time: "11:15 AM", description: "Hitech City, Hyderabad — evacuation advised", icon: "flood", color: "amber" },
  { id: "3", title: "Fire Outbreak", time: "09:45 AM", description: "Hyderabad Industrial Area — contained", icon: "fire", color: "green" },
  { id: "4", title: "Gas Leakage", time: "12:00 PM", description: "Secunderabad, Hyderabad — 200m exclusion zone", icon: "gas", color: "orange" },
];
