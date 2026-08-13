import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, RefreshCw, Cpu, FileText, Radio } from "lucide-react";
import clsx from "clsx";
import { MetricCard } from "../../components/common/KPICard";
import { GlassCard } from "../../components/common/GlassCard";
import { FeatureImportanceChart } from "../../components/xai/FeatureImportanceChart";
import {
  IncidentXAIList,
  XAIExplanationPanel,
} from "../../components/xai/XAIExplanationPanel";
import * as apiClient from "../../api/client";
import { MOCK_INCIDENTS } from "../../data/mockIncidents";
import { buildXAIAnalytics } from "../../utils/xaiExplainer";
import type { XAIAnalytics } from "../../types/xai";

export function AIAnalyticsPage() {
  const [analytics, setAnalytics] = useState<XAIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.fetchXAIAnalytics();
      setAnalytics(data);
      setLive(true);
      setError(null);
      setSelectedId((prev) => prev ?? data.incidents[0]?.id ?? null);
    } catch {
      const fallback = buildXAIAnalytics(MOCK_INCIDENTS);
      setAnalytics(fallback);
      setLive(false);
      setError("Backend unavailable — showing local XAI analysis from seed data");
      setSelectedId((prev) => prev ?? fallback.incidents[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => analytics?.incidents.find((i) => i.id === selectedId) ?? null,
    [analytics, selectedId]
  );

  if (loading && !analytics) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-accent-cyan" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-4 overflow-y-auto p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-accent-cyan" />
            <h1 className="text-xl font-bold text-white">AI Analytics & Explainability</h1>
            <span
              className={clsx(
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                live
                  ? "border-emergency-emerald/30 bg-emergency-emerald/10 text-emergency-emerald"
                  : "border-emergency-amber/30 bg-emergency-amber/10 text-emergency-amber"
              )}
            >
              <Radio className="h-3 w-3" />
              {live ? "Live API" : "Offline mode"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Transparent priority model with SHAP-style explanations for every incident
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
          Re-analyze
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-emergency-amber/30 bg-emergency-amber/10 px-3 py-2 text-xs text-emergency-amber">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-neuro-grid">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard label="Incidents Analyzed" value={analytics.stats.total} theme="blue" icon="brain" />
          <MetricCard label="Critical Priority" value={analytics.stats.critical} theme="red" icon="alert" />
          <MetricCard label="Avg Priority Score" value={analytics.stats.avg_score} theme="orange" icon="target" />
          <MetricCard label="Anomalies Flagged" value={analytics.stats.anomalies} theme="purple" icon="shield" />
        </div>
      </div>

      {/* Model info */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-4 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/15">
              <Cpu className="h-5 w-5 text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{analytics.model_type}</p>
              <p className="text-[10px] text-slate-500">Version {analytics.model_version} · Free & auditable</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{analytics.methodology}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-300">How it works</p>
              <ul className="mt-2 space-y-1 text-[10px] text-slate-500">
                <li>• Weighted feature scoring (0–100)</li>
                <li>• SHAP-compatible additive breakdown</li>
                <li>• Natural-language audit trail</li>
                <li>• Anomaly validation on intake</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main split view */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <IncidentXAIList
            incidents={analytics.incidents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            query={query}
            onQueryChange={setQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
          />
        </div>
        <div className="lg:col-span-8">
          <XAIExplanationPanel incident={selected} />
        </div>
      </div>

      {/* Aggregate chart */}
      <FeatureImportanceChart features={analytics.aggregate_features} />
    </div>
  );
}
