import type { Incident, NeedsRequested } from "../types";
import type { XAIExplanation } from "../types/xai";

function needsSummary(needs: NeedsRequested): string[] {
  const labels: Record<keyof NeedsRequested, string> = {
    food: "food supplies",
    water: "clean water",
    medical: "medical kits",
    shelter: "emergency shelter",
    rescue_team: "rescue teams",
  };
  return (Object.keys(labels) as (keyof NeedsRequested)[])
    .filter((k) => needs[k])
    .map((k) => labels[k]);
}

/** Client-side mirror of backend xai_explainer — works offline with mock data */
export function explainIncident(incident: Incident): XAIExplanation {
  const { priority_score: score, priority_level: level, disaster_type: disaster, name } = incident;
  const { affected_count: affected, injured_count: injured, children_count: children, elderly_count: elderly } = incident;
  const status = incident.status.replace(/_/g, " ");
  const factors = incident.shap_breakdown ?? [];
  const anomalies = incident.anomaly_flags ?? [];

  const increases = factors.filter((f) => f.direction === "increase");
  const decreases = factors.filter((f) => f.direction === "decrease");
  const topIncrease = increases[0];

  const summary =
    `${name} is classified as ${level} priority (${score}/100) due to a ` +
    `${disaster.replace(/_/g, " ")} event affecting ${affected.toLocaleString()} people, including ` +
    `${injured} reported injuries and ${children + elderly} vulnerable individuals (children/elderly).`;

  const reasoning_steps = factors.map((f, i) => {
    const sign = f.direction === "increase" ? "+" : "";
    const verb = f.direction === "increase" ? "raises" : "lowers";
    return `Step ${i + 1}: ${f.label} → ${sign}${f.contribution_pct} points (${verb} urgency).`;
  });

  const primary_driver = topIncrease
    ? `The dominant driver is "${topIncrease.label}" (+${topIncrease.contribution_pct} pts), which heavily influenced the ${level} classification.`
    : "No single factor dominated; score reflects combined baseline severity.";

  const requested = needsSummary(incident.needs);
  const needs_summary = requested.length
    ? `Requested resources: ${requested.join(", ")}.`
    : "No specific resource requests were flagged.";

  let dispatch_recommendation: string;
  if (level === "critical" || level === "high") {
    dispatch_recommendation =
      `Recommend immediate dispatch — escalate to active response. Current status: ${status}. Prioritize nearest available units.`;
  } else if (level === "medium") {
    dispatch_recommendation =
      `Schedule staged response within standard SLA. Monitor for escalation triggers. Status: ${status}.`;
  } else {
    dispatch_recommendation =
      `Low urgency — maintain monitoring and pre-position resources if deficit persists. Status: ${status}.`;
  }

  const risk_factors = increases.filter((f) => f.contribution_pct >= 10).map((f) => f.label);
  const mitigating_factors = decreases.map((f) => f.label);

  let confidence_pct = 92;
  if (anomalies.length) confidence_pct -= Math.min(25, anomalies.length * 8);
  confidence_pct = Math.max(55, Math.round(confidence_pct * 10) / 10);

  return {
    summary,
    primary_driver,
    reasoning_steps,
    dispatch_recommendation,
    needs_summary,
    risk_factors,
    mitigating_factors,
    confidence_pct,
    anomaly_warnings: anomalies,
  };
}

export function aggregateFeatureImportance(incidents: Incident[]) {
  const totals = new Map<string, number[]>();
  for (const inc of incidents) {
    for (const f of inc.shap_breakdown ?? []) {
      const list = totals.get(f.label) ?? [];
      list.push(Math.abs(f.contribution_pct));
      totals.set(f.label, list);
    }
  }
  return [...totals.entries()]
    .map(([label, vals]) => ({
      label,
      avg_contribution: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
      incident_count: vals.length,
    }))
    .sort((a, b) => b.avg_contribution - a.avg_contribution);
}

export function buildXAIAnalytics(incidents: Incident[]) {
  const explained = incidents.map((incident) => ({
    ...incident,
    explanation: explainIncident(incident),
  }));
  const scores = explained.map((i) => i.priority_score);
  return {
    model_version: "1.0.0",
    model_type: "Transparent Weighted Feature Model (SHAP-compatible)",
    methodology:
      "Additive scoring from disaster base weight, population impact, injuries, vulnerable demographics, and resource deficit. Each factor's signed contribution is exposed for audit.",
    incidents: explained,
    aggregate_features: aggregateFeatureImportance(incidents),
    stats: {
      total: explained.length,
      critical: explained.filter((i) => i.priority_level === "critical").length,
      avg_score: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      anomalies: explained.filter((i) => i.anomaly_flags.length > 0).length,
    },
  };
}
