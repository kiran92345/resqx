export type ThermalLevel = "cold" | "mild" | "warm" | "hot" | "extreme";

export interface ThermalInfo {
  level: ThermalLevel;
  color: string;
  label: string;
  glow: string;
}

/** Thermal color scale for India (°C) */
export function tempToThermal(temp: number): ThermalInfo {
  if (temp < 15) return { level: "cold", color: "#3B82F6", label: "Cold", glow: "rgba(59,130,246,0.5)" };
  if (temp < 25) return { level: "mild", color: "#10B981", label: "Mild", glow: "rgba(16,185,129,0.5)" };
  if (temp < 32) return { level: "warm", color: "#F59E0B", label: "Warm", glow: "rgba(245,158,11,0.55)" };
  if (temp < 38) return { level: "hot", color: "#EF4444", label: "Hot", glow: "rgba(239,68,68,0.55)" };
  return { level: "extreme", color: "#DC2626", label: "Extreme Heat", glow: "rgba(220,38,38,0.65)" };
}

export function thermalGradient(temp: number): string {
  const t = Math.max(10, Math.min(45, temp));
  const ratio = (t - 10) / 35;
  if (ratio < 0.25) return `rgb(${Math.round(59 + ratio * 4 * 40)}, ${Math.round(130 + ratio * 4 * 55)}, 246)`;
  if (ratio < 0.5) return `rgb(${Math.round(16 + (ratio - 0.25) * 4 * 229)}, ${Math.round(185 - (ratio - 0.25) * 4 * 75)}, ${Math.round(129 - (ratio - 0.25) * 4 * 100)})`;
  if (ratio < 0.75) return `rgb(245, ${Math.round(158 - (ratio - 0.5) * 4 * 100)}, ${Math.round(11 - (ratio - 0.5) * 4 * 11)})`;
  return `rgb(220, ${Math.round(38 - (ratio - 0.75) * 4 * 38)}, ${Math.round(38 - (ratio - 0.75) * 4 * 38)})`;
}

export const THERMAL_LEGEND = [
  { label: "Cold (<15°C)", color: "#3B82F6" },
  { label: "Mild (15–25°C)", color: "#10B981" },
  { label: "Warm (25–32°C)", color: "#F59E0B" },
  { label: "Hot (32–38°C)", color: "#EF4444" },
  { label: "Extreme (>38°C)", color: "#DC2626" },
];

/** Interpolate temperature at grid cell from nearest city readings */
export function interpolateTemp(
  lat: number,
  lng: number,
  readings: { lat: number; lng: number; temp: number }[]
): number {
  if (readings.length === 0) return 28;
  let totalWeight = 0;
  let weightedTemp = 0;
  for (const r of readings) {
    const dist = Math.sqrt((lat - r.lat) ** 2 + (lng - r.lng) ** 2) + 0.01;
    const w = 1 / dist ** 2;
    weightedTemp += r.temp * w;
    totalWeight += w;
  }
  return weightedTemp / totalWeight;
}

/** Build thermal grid cells over India bounding box */
export function buildThermalGrid(
  readings: { lat: number; lng: number; temp: number }[],
  cols = 14,
  rows = 10
) {
  const latMin = 8, latMax = 35, lngMin = 68, lngMax = 97;
  const cells: { lat: number; lng: number; temp: number; thermal: ThermalInfo }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat = latMin + ((latMax - latMin) * r) / (rows - 1);
      const lng = lngMin + ((lngMax - lngMin) * c) / (cols - 1);
      const temp = interpolateTemp(lat, lng, readings);
      cells.push({ lat, lng, temp, thermal: tempToThermal(temp) });
    }
  }
  return cells;
}
