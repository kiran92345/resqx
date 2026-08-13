import React, { useEffect, useState } from "react";
import { Zap, Boxes } from "lucide-react";
import * as apiClient from "../../api/client";
import type { ResourceInventory, AllocationPlan, Incident } from "../../types";

export function ResourceHub() {
  const [resources, setResources] = useState<ResourceInventory[]>([]);
  const [plans, setPlans] = useState<AllocationPlan[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  async function load() {
    const [res, alloc, inc] = await Promise.all([
      apiClient.fetchResources(),
      apiClient.fetchAllocations(),
      apiClient.fetchIncidents(),
    ]);
    setResources(res);
    setPlans(alloc);
    setIncidents(inc);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleOptimize() {
    setOptimizing(true);
    try {
      const newPlans = await apiClient.runOptimization();
      setPlans(newPlans);
    } finally {
      setOptimizing(false);
    }
  }

  const incidentName = (id: string) => incidents.find((i) => i.id === id)?.name ?? id;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Resource Distribution</h1>
          <p className="text-sm text-slate-400">
            LP-optimized allocation matrix across all open incidents (PuLP solver).
          </p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="flex items-center gap-2 rounded-lg bg-emergency-red px-4 py-2 text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          {optimizing ? "Optimizing..." : "Run Optimization"}
        </button>
      </div>

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Boxes className="h-4 w-4" /> Current Stock
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {resources.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-xs capitalize text-slate-500">{r.resource_type.replace("_", " ")}</p>
              <p className="text-lg font-bold">{r.available_units}</p>
              <p className="text-[11px] text-slate-600">{r.location_hub}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-300">Allocation Matrix</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Incident</th>
                <th className="px-4 py-3">Food</th>
                <th className="px-4 py-3">Water</th>
                <th className="px-4 py-3">Medical Kits</th>
                <th className="px-4 py-3">Rescue Teams</th>
                <th className="px-4 py-3">Shelter</th>
                <th className="px-4 py-3">ETA</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-medium">{incidentName(p.incident_id)}</td>
                  <td className="px-4 py-3">{p.assigned_resources.food}</td>
                  <td className="px-4 py-3">{p.assigned_resources.water}</td>
                  <td className="px-4 py-3">{p.assigned_resources.medical_kits}</td>
                  <td className="px-4 py-3">{p.assigned_resources.rescue_teams}</td>
                  <td className="px-4 py-3">{p.assigned_resources.shelter_units}</td>
                  <td className="px-4 py-3">{p.eta_minutes ? `${p.eta_minutes} min` : "—"}</td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    No allocation plan yet — click "Run Optimization."
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
