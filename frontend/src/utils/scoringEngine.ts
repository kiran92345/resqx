import type { DisasterType, Incident, PriorityLevel, ShapFactor } from "../types";

const DISASTER_BASE_WEIGHT: Record<DisasterType, number> = {
  earthquake: 30,
  fire: 26,
  flood: 22,
  outbreak: 24,
  other: 15,
};

const MAX_SCORE = 100;

function clamp(value: number, lo = 0, hi = MAX_SCORE): number {
  return Math.max(lo, Math.min(hi, value));
}

export function computePriorityScore(
  disasterType: DisasterType,
  affectedCount: number,
  injuredCount: number,
  childrenCount: number,
  elderlyCount: number,
  nearbyResourceDeficitPct: number,
  existingWaterSupplyAvailable = false
): { score: number; level: PriorityLevel; factors: ShapFactor[] } {
  const factors: ShapFactor[] = [];

  const base = DISASTER_BASE_WEIGHT[disasterType] ?? 15;
  factors.push({
    label: `Base severity — ${disasterType.replace("_", " ")}`,
    contribution_pct: Math.round(base * 10) / 10,
    direction: "increase",
  });

  const popContribution = clamp(affectedCount / 25, 0, 20);
  factors.push({
    label: "Population Density & Affected Count",
    contribution_pct: Math.round(popContribution * 10) / 10,
    direction: "increase",
  });

  const injuryContribution = clamp(injuredCount * 1.5, 0, 25);
  factors.push({
    label: "Critical Injuries",
    contribution_pct: Math.round(injuryContribution * 10) / 10,
    direction: "increase",
  });

  const vulnerable = childrenCount + elderlyCount;
  const vulnerableContribution = clamp(vulnerable * 1.2, 0, 20);
  if (vulnerableContribution > 0) {
    factors.push({
      label: "Vulnerable Demographic (Children/Elderly)",
      contribution_pct: Math.round(vulnerableContribution * 10) / 10,
      direction: "increase",
    });
  }

  const deficitContribution = clamp(nearbyResourceDeficitPct * 0.15, 0, 15);
  if (deficitContribution > 0) {
    factors.push({
      label: "Existing Resource Deficit Nearby",
      contribution_pct: Math.round(deficitContribution * 10) / 10,
      direction: "increase",
    });
  }

  if (existingWaterSupplyAvailable) {
    factors.push({
      label: "Nearby Water Supply Available",
      contribution_pct: -8,
      direction: "decrease",
    });
  }

  const rawScore = factors.reduce((s, f) => s + f.contribution_pct, 0);
  const score = Math.round(clamp(rawScore) * 10) / 10;

  let level: PriorityLevel = "low";
  if (score >= 75) level = "critical";
  else if (score >= 50) level = "high";
  else if (score >= 25) level = "medium";

  factors.sort((a, b) => Math.abs(b.contribution_pct) - Math.abs(a.contribution_pct));

  return { score, level, factors };
}

export function detectAnomalies(
  affectedCount: number,
  injuredCount: number,
  childrenCount: number,
  elderlyCount: number
): string[] {
  const flags: string[] = [];
  if (injuredCount > affectedCount) flags.push("Injured count exceeds total affected count");
  if (childrenCount + elderlyCount > affectedCount) {
    flags.push("Children + elderly count exceeds total affected count");
  }
  if (affectedCount > 50000) flags.push("Affected count unusually high — please verify");
  if (affectedCount === 0) flags.push("Affected count is zero — request may be a test/error");
  return flags;
}

export function buildMockIncident(
  partial: Omit<Incident, "id" | "priority_score" | "priority_level" | "shap_breakdown" | "anomaly_flags"> & { id?: string }
): Incident {
  const { score, level, factors } = computePriorityScore(
    partial.disaster_type,
    partial.affected_count,
    partial.injured_count,
    partial.children_count,
    partial.elderly_count,
    30,
    false
  );
  return {
    ...partial,
    id: partial.id ?? crypto.randomUUID(),
    priority_score: score,
    priority_level: level,
    shap_breakdown: factors,
    anomaly_flags: detectAnomalies(
      partial.affected_count,
      partial.injured_count,
      partial.children_count,
      partial.elderly_count
    ),
  };
}
