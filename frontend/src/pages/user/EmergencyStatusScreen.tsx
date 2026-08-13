import React, { useEffect, useState } from "react";
import { EMERGENCY_PIPELINE, needsVerification, pipelineIndex, pipelineProgress } from "../../data/emergencyPipeline";
import { fromApiIncident } from "../../data/incidentTracking";
import { resolveUserIncident } from "../../services/userEmergencyStore";
import type { Incident } from "../../types";
import clsx from "clsx";
import { UserPageHeader } from "../../components/user/UserPageHeader";

export function EmergencyStatusScreen() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("resqx_last_incident");
    if (!id) { setLoading(false); return; }
    resolveUserIncident(id)
      .then(setIncident)
      .catch(() => setIncident(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <UserPageHeader title="Emergency Status" />
        <p className="text-sm text-[var(--text-muted)]">Loading status…</p>
      </>
    );
  }

  if (!incident) {
    return (
      <>
        <UserPageHeader title="Emergency Status" subtitle="Follow your SOS through the response pipeline" />
        <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-[var(--text-muted)]">No active emergency.</p>
        <p className="text-sm text-[var(--text-faint)]">Press SOS on the home screen to report an emergency.</p>
        </div>
      </>
    );
  }

  const track = fromApiIncident(incident);
  const progress = pipelineProgress(incident.status);
  const verify = needsVerification(incident.anomaly_flags);
  const currentStep = pipelineIndex(incident.status);

  return (
    <div className="max-w-3xl">
      <UserPageHeader title="Emergency Status" subtitle={incident.name} />

      {verify && (
        <div className="mb-4 rounded-xl border border-emergency-amber/40 bg-emergency-amber/10 px-3 py-2 text-xs text-emergency-amber">
          Needs verification — an operator is reviewing this report. Genuine emergencies remain protected.
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">Progress</span>
          <span className="font-semibold text-accent-cyan">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div className="h-full rounded-full bg-accent-cyan transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs capitalize text-[var(--text-muted)]">
          Priority: <span className="font-semibold text-[var(--text-primary)]">{incident.priority_level}</span>
          {" · "}
          Unit: <span className="text-[var(--text-primary)]">{track.unitLabel}</span>
          {" · "}
          ETA: <span className="text-[var(--text-primary)]">{track.etaMinutes} min</span>
        </p>
      </div>

      <div className="space-y-0">
        {EMERGENCY_PIPELINE.map((step, i) => {
          const done = i <= currentStep;
          const current = i === currentStep;
          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold",
                  done ? "border-emergency-emerald/50 bg-emergency-emerald/15 text-emergency-emerald" : "border-[var(--border-subtle)] text-[var(--text-faint)]",
                  current && "ring-2 ring-accent-cyan/50"
                )}>
                  {done ? "✓" : i + 1}
                </div>
                {i < EMERGENCY_PIPELINE.length - 1 && (
                  <div className={clsx("my-1 w-0.5 flex-1 min-h-[24px]", done ? "bg-emergency-emerald/40" : "bg-[var(--border-subtle)]")} />
                )}
              </div>
              <div className="pb-5 pt-1">
                <p className={clsx("text-sm font-medium", done ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>{step.label}</p>
                {current && <p className="text-[10px] text-accent-cyan">Current stage</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
