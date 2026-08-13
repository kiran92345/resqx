import React, { useEffect, useState } from "react";
import { StatusPipeline } from "../../components/dispatch/StatusPipeline";
import { PriorityBadge } from "../../components/common/KPICard";
import { needsVerification } from "../../data/emergencyPipeline";
import * as apiClient from "../../api/client";
import type { Incident, AllocationPlan, RequestStatus } from "../../types";

const NEXT_STAGE: Partial<Record<RequestStatus, RequestStatus>> = {
  submitted: "in_review",
  in_review: "dispatched",
  dispatched: "in_transit",
  in_transit: "delivered",
  delivered: "resolved",
};

export function DispatchCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [plans, setPlans] = useState<AllocationPlan[]>([]);

  async function load() {
    const [inc, alloc] = await Promise.all([
      apiClient.fetchIncidents(),
      apiClient.fetchAllocations(),
    ]);
    setIncidents(inc.filter((i) => i.status !== "resolved"));
    setPlans(alloc);
  }

  useEffect(() => {
    load();
  }, []);

  async function advance(inc: Incident) {
    const next = NEXT_STAGE[inc.status];
    if (!next) return;
    await apiClient.updateIncidentStatus(inc.id, next);
    load();
  }

  async function verify(inc: Incident) {
    await apiClient.updateIncidentStatus(inc.id, "dispatched");
    load();
  }

  const planFor = (id: string) => plans.find((p) => p.incident_id === id);
  const pendingVerification = incidents.filter((i) => needsVerification(i.anomaly_flags) || i.status === "in_review");

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dispatch Center</h1>
        <p className="text-sm text-slate-400">
          Responder workflow: Accept → Reassign → Track → Resolve. Fraud/duplicate reports require operator verification.
        </p>
      </div>

      {pendingVerification.length > 0 && (
        <section className="rounded-xl border border-emergency-amber/30 bg-emergency-amber/5 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emergency-amber">
            Needs Verification ({pendingVerification.length})
          </h2>
          <div className="space-y-3">
            {pendingVerification.map((inc) => (
              <div key={inc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emergency-amber/20 bg-black/20 px-4 py-3">
                <div>
                  <p className="font-medium">{inc.name}</p>
                  <p className="text-xs text-slate-500">{inc.anomaly_flags.join(" · ") || "Awaiting operator review"}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => verify(inc)} className="rounded-md bg-emergency-emerald/20 px-3 py-1.5 text-xs font-medium text-emergency-emerald hover:bg-emergency-emerald/30">
                    Verify & Assign
                  </button>
                  <button onClick={() => advance(inc)} className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-700">
                    Reject / Reassign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-4">
        {incidents.map((inc) => (
          <div key={inc.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{inc.name}</p>
                <p className="text-xs capitalize text-slate-500">{inc.disaster_type}</p>
                {inc.anomaly_flags.length > 0 && (
                  <p className="mt-1 text-[10px] text-emergency-amber">{inc.anomaly_flags[0]}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <PriorityBadge level={inc.priority_level} />
                {NEXT_STAGE[inc.status] && (
                  <button
                    onClick={() => advance(inc)}
                    className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-700"
                  >
                    {inc.status === "dispatched" ? "Accept → On the Way" : `Advance → ${NEXT_STAGE[inc.status]?.replace("_", " ")}`}
                  </button>
                )}
              </div>
            </div>
            <StatusPipeline current={inc.status} etaMinutes={planFor(inc.id)?.eta_minutes} />
          </div>
        ))}
        {incidents.length === 0 && (
          <p className="text-sm text-slate-600">No active dispatches. All requests resolved.</p>
        )}
      </div>
    </div>
  );
}
