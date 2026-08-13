export interface XAIExplanation {
  summary: string;
  primary_driver: string;
  reasoning_steps: string[];
  dispatch_recommendation: string;
  needs_summary: string;
  risk_factors: string[];
  mitigating_factors: string[];
  confidence_pct: number;
  anomaly_warnings: string[];
}

export interface AggregateFeature {
  label: string;
  avg_contribution: number;
  incident_count: number;
}

export interface ExplainedIncident {
  id: string;
  name: string;
  disaster_type: string;
  priority_score: number;
  priority_level: string;
  affected_count: number;
  status: string;
  shap_breakdown: import("./index").ShapFactor[];
  anomaly_flags: string[];
  explanation: XAIExplanation;
  [key: string]: unknown;
}

export interface XAIAnalytics {
  model_version: string;
  model_type: string;
  methodology: string;
  incidents: ExplainedIncident[];
  aggregate_features: AggregateFeature[];
  stats: {
    total: number;
    critical: number;
    avg_score: number;
    anomalies: number;
  };
}
