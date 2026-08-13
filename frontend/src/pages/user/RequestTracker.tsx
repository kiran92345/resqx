import React, { useEffect, useState } from "react";
import { StatusPipeline } from "../../components/dispatch/StatusPipeline";
import { PriorityBadge } from "../../components/common/KPICard";
import * as apiClient from "../../api/client";
import type { Incident, AllocationPlan } from "../../types";

export function RequestTracker({ incidentId }: { incidentId: string | null }) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [plan, setPlan] = useState<AllocationPlan | null>(null);

  useEffect(() => {
    if (!incidentId) return;
    let cancelled = false;

    async function load() {
      try {
        const incidents = await apiClient.fetchIncidents();
        const found = incidents.find((i) => i.id === incidentId) ?? null;
        if (!cancelled) setIncident(found);
        try {
          const p = await apiClient.fetchAllocations();
          if (!cancelled) setPlan(p.find((x) => x.incident_id === incidentId) ?? null);
        } catch {
          /* no plan yet */
        }
      } catch {
        /* backend unreachable */
      }
    }

    load();
    const interval = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [incidentId]);

  if (!incidentId) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Submit a request first to see live tracking here.
      </div>
    );
  }

  if (!incident) {
    return <div className="p-6 text-sm text-slate-500">Loading your request status...</div>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{incident.name}</h1>
          <p className="text-sm capitalize text-slate-400">{incident.disaster_type}</p>
        </div>
        <PriorityBadge level={incident.priority_level} />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <StatusPipeline current={incident.status} etaMinutes={plan?.eta_minutes} />
      </div>

      {plan && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Assigned resources</h2>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {Object.entries(plan.assigned_resources).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-950 p-2 text-center">
                <p className="text-lg font-bold">{v}</p>
                <p className="text-[11px] capitalize text-slate-500">{k.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
