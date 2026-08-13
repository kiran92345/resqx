import React from "react";
import {
  Brain, AlertTriangle, ShieldCheck, Truck, ListOrdered, Target,
} from "lucide-react";
import { GlassCard } from "../common/GlassCard";
import { PriorityBadge } from "../common/KPICard";
import { XAIWaterfallChart } from "./XAIWaterfallChart";
import type { ExplainedIncident } from "../../types/xai";
import clsx from "clsx";

export function XAIExplanationPanel({ incident }: { incident: ExplainedIncident | null }) {
  if (!incident) {
    return (
      <GlassCard className="flex h-full min-h-[480px] flex-col items-center justify-center p-8 text-center">
        <Brain className="mb-3 h-10 w-10 text-slate-600" />
        <p className="text-sm text-slate-400">Select an incident to view its AI explanation</p>
        <p className="mt-1 text-xs text-slate-600">
          Transparent SHAP-style breakdown with natural-language audit trail
        </p>
      </GlassCard>
    );
  }

  const { explanation: ex } = incident;

  return (
    <GlassCard className="flex h-full max-h-[calc(100vh-180px)] flex-col overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent-cyan" />
              <h2 className="text-lg font-bold text-white">{incident.name}</h2>
            </div>
            <p className="mt-0.5 text-xs capitalize text-slate-500">
              {String(incident.disaster_type).replace(/_/g, " ")} · {incident.affected_count.toLocaleString()} affected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge level={String(incident.priority_level)} />
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">
              {ex.confidence_pct}% confidence
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Executive summary */}
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            AI Summary
          </p>
          <p className="text-sm leading-relaxed text-slate-300">{ex.summary}</p>
          <p className="mt-2 text-sm text-accent-cyan">{ex.primary_driver}</p>
        </section>

        {/* Waterfall chart */}
        <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <XAIWaterfallChart factors={incident.shap_breakdown} score={incident.priority_score} />
        </section>

        {/* Reasoning chain */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-slate-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Step-by-step reasoning
            </p>
          </div>
          <ol className="space-y-2">
            {ex.reasoning_steps.map((step, i) => (
              <li
                key={i}
                className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-slate-400"
              >
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* Risk & mitigation */}
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-emergency-red" />
              <p className="text-xs font-semibold text-emergency-red">Risk factors</p>
            </div>
            {ex.risk_factors.length ? (
              <ul className="space-y-1">
                {ex.risk_factors.map((r) => (
                  <li key={r} className="text-xs text-slate-400">• {r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No major risk amplifiers</p>
            )}
          </section>

          <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emergency-emerald" />
              <p className="text-xs font-semibold text-emergency-emerald">Mitigating factors</p>
            </div>
            {ex.mitigating_factors.length ? (
              <ul className="space-y-1">
                {ex.mitigating_factors.map((m) => (
                  <li key={m} className="text-xs text-slate-400">• {m}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">None identified</p>
            )}
          </section>
        </div>

        {/* Dispatch recommendation */}
        <section className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent-cyan" />
            <p className="text-xs font-semibold text-accent-cyan">Dispatch recommendation</p>
          </div>
          <p className="text-sm text-slate-300">{ex.dispatch_recommendation}</p>
          <p className="mt-2 text-xs text-slate-500">{ex.needs_summary}</p>
        </section>

        {/* Anomalies */}
        {ex.anomaly_warnings.length > 0 && (
          <section className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-emergency-amber" />
              <p className="text-xs font-semibold text-emergency-amber">Validation flags</p>
            </div>
            <ul className="space-y-1">
              {ex.anomaly_warnings.map((a) => (
                <li key={a} className="text-xs text-amber-200/80">• {a}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </GlassCard>
  );
}

export function IncidentXAIList({
  incidents,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
}: {
  incidents: ExplainedIncident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  typeFilter: string;
  onTypeFilterChange: (t: string) => void;
}) {
  const filtered = incidents.filter((i) => {
    if (typeFilter !== "all" && i.disaster_type !== typeFilter) return false;
    if (!query) return true;
    return i.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <GlassCard className="flex h-full max-h-[calc(100vh-180px)] flex-col overflow-hidden">
      <div className="border-b border-white/5 p-4">
        <h3 className="text-sm font-semibold text-slate-300">All Incidents</h3>
        <p className="text-[10px] text-slate-500">{filtered.length} with XAI explanations</p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search incidents..."
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-accent-cyan/40"
          />
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none"
          >
            <option value="all">All disaster types</option>
            <option value="flood">Flood</option>
            <option value="fire">Fire</option>
            <option value="earthquake">Earthquake</option>
            <option value="outbreak">Outbreak</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((inc) => (
          <button
            key={inc.id}
            onClick={() => onSelect(inc.id)}
            className={clsx(
              "mb-1.5 w-full rounded-lg border p-3 text-left transition",
              selectedId === inc.id
                ? "border-accent-cyan/40 bg-accent-cyan/10"
                : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-white">{inc.name}</p>
              <PriorityBadge level={String(inc.priority_level)} />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] capitalize text-slate-500">{String(inc.disaster_type)}</span>
              <span className="text-xs font-bold text-slate-400">{inc.priority_score}/100</span>
            </div>
            <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
              {inc.explanation.summary}
            </p>
            {inc.anomaly_flags.length > 0 && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emergency-amber">
                <AlertTriangle className="h-3 w-3" /> {inc.anomaly_flags.length} flag(s)
              </span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-600">No matching incidents</p>
        )}
      </div>
    </GlassCard>
  );
}
