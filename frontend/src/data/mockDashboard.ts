export const MOCK_KPIS = [
  { label: "Active Incidents", value: 24, indicator: "5 from last hour", up: true, theme: "red", icon: "alert" as const },
  { label: "People Affected", value: 1245, indicator: "320 from last hour", up: true, theme: "orange", format: "number", icon: "users" as const },
  { label: "Resources Deployed", value: "87%", badge: "Optimal", theme: "blue", icon: "truck" as const },
  { label: "Resolved Incidents", value: 15, indicator: "8 from last 24h", up: true, theme: "green", icon: "check" as const },
  { label: "Avg Response Time", value: "12 min", indicator: "3 min from last hour", up: false, theme: "purple", icon: "clock" as const, trendGood: true },
];

export const MOCK_ALERTS = [
  { id: "1", title: "Flood in Sector 7", severity: "High" as const, time: "2 min ago" },
  { id: "2", title: "Earthquake in North Zone", severity: "High" as const, time: "8 min ago" },
  { id: "3", title: "Fire in Industrial Area", severity: "Medium" as const, time: "15 min ago" },
  { id: "4", title: "Landslide in Hill Area", severity: "Medium" as const, time: "18 min ago" },
  { id: "5", title: "Medical Emergency in City Center", severity: "Low" as const, time: "22 min ago" },
  { id: "6", title: "Gas Leak near Block C", severity: "High" as const, time: "31 min ago" },
];

export const MOCK_MOBILE_ALERTS = [
  { id: "1", title: "Road Accident", time: "10:30 AM", description: "Multi-vehicle collision on NH-44, Banjara Hills", icon: "accident", color: "red" },
  { id: "2", title: "Heavy Flood", time: "11:15 AM", description: "Water level rising in Sector 7", icon: "flood", color: "amber" },
  { id: "3", title: "Fire Outbreak", time: "09:45 AM", description: "Industrial warehouse fire contained", icon: "fire", color: "green" },
  { id: "4", title: "Gas Leakage", time: "12:00 PM", description: "Pipeline rupture near residential block C", icon: "gas", color: "orange" },
];

export const MOCK_RESOURCE_DONUT = [
  { name: "Available", value: 13, color: "#10B981" },
  { name: "In Transit", value: 25, color: "#3B82F6" },
  { name: "Deployed", value: 87, color: "#F59E0B" },
  { name: "Maintenance", value: 8, color: "#A855F7" },
];

export const MOCK_TREND_WEEK = [
  { day: "Mon", incidents: 18 }, { day: "Tue", incidents: 24 }, { day: "Wed", incidents: 32 },
  { day: "Thu", incidents: 28 }, { day: "Fri", incidents: 35 }, { day: "Sat", incidents: 22 }, { day: "Sun", incidents: 19 },
];

export const MOCK_TREND_MONTH = [
  { day: "W1", incidents: 85 }, { day: "W2", incidents: 92 }, { day: "W3", incidents: 78 }, { day: "W4", incidents: 88 },
];

export const MOCK_RISK_AREAS = [
  { rank: 1, name: "North Zone", risk: 92 },
  { rank: 2, name: "East Zone", risk: 85 },
  { rank: 3, name: "Hill Area", risk: 78 },
  { rank: 4, name: "Industrial Area", risk: 71 },
];

export const MOCK_AI_RECOMMENDATIONS = [
  { id: "1", text: "High flood risk in Hitech City, Hyderabad — Deploy rescue boats and medical kits", icon: "flood", color: "blue" },
  { id: "2", text: "Increase medical supplies in North Delhi — Disease outbreak prediction active", icon: "medical", color: "green" },
  { id: "3", text: "Deploy NDRF teams to Darjeeling Hill Area — Landslide probability high", icon: "rescue", color: "orange" },
  { id: "4", text: "Pre-position fire units in Mumbai Bandra — Industrial risk elevated", icon: "fire", color: "red" },
];

export const MOCK_NOTIFICATIONS = [
  { id: "1", title: "New incident reported", body: "Flood in Hitech City, Hyderabad — High priority", time: "2m ago", read: false },
  { id: "2", title: "Resource deployed", body: "Ambulance A12 dispatched to Banjara Hills, Telangana", time: "5m ago", read: false },
  { id: "3", title: "AI alert", body: "Landslide risk elevated in Darjeeling, West Bengal", time: "12m ago", read: false },
  { id: "4", title: "Incident resolved", body: "Fire in Hyderabad Industrial Area marked resolved", time: "1h ago", read: true },
];

export const EMERGENCY_CATEGORIES = [
  { id: "medical", label: "Medical Emergency", icon: "heart", tint: "red" },
  { id: "fire", label: "Fire", icon: "flame", tint: "orange" },
  { id: "accident", label: "Road Accident", icon: "car", tint: "dark-red" },
  { id: "flood", label: "Flood", icon: "waves", tint: "cyan" },
  { id: "crime", label: "Crime", icon: "mask", tint: "purple" },
  { id: "other", label: "Other", icon: "dots", tint: "slate" },
] as const;

export type EmergencyCategoryId = (typeof EMERGENCY_CATEGORIES)[number]["id"];
