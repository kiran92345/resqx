import React from "react";
import { X, Brain } from "lucide-react";
import type { Incident } from "../../types";

export function XAIDrawer({
  incident,
  onClose,
}: {
  incident: Incident | null;
  onClose: () => void;
}) {
  if (!incident) return null;
  const maxAbs = Math.max(...incident.shap_breakdown.map((f) => Math.abs(f.contribution_pct)), 1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-slate-800 bg-slate-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emergency-red" />
            <h2 className="text-lg font-bold">Why this priority?</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-1 text-sm text-slate-400">{incident.name}</p>
        <p className="mb-6 text-3xl font-bold">
          {incident.priority_score}
          <span className="ml-2 text-sm font-normal capitalize text-slate-400">
            {incident.priority_level} priority
          </span>
        </p>

        <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
          Feature contribution breakdown
        </p>
        <div className="space-y-3">
          {incident.shap_breakdown.map((f, i) => (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-300">{f.label}</span>
                <span
                  className={f.direction === "increase" ? "text-emergency-red" : "text-emergency-emerald"}
                >
                  {f.contribution_pct > 0 ? "+" : ""}
                  {f.contribution_pct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    f.direction === "increase" ? "bg-emergency-red" : "bg-emergency-emerald"
                  }`}
                  style={{ width: `${(Math.abs(f.contribution_pct) / maxAbs) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {incident.anomaly_flags.length > 0 && (
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-950/40 p-3 text-sm text-amber-300">
            <p className="mb-1 font-semibold">Validation flags</p>
            <ul className="list-inside list-disc space-y-0.5">
              {incident.anomaly_flags.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-600">
          Scores are computed additively from a transparent weighted-feature model,
          shown here as a SHAP-style waterfall so officers can audit every dispatch decision.
        </p>
      </div>
    </div>
  );
}
