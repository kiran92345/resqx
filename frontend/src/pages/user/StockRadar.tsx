import React, { useEffect, useState } from "react";
import { Radar, AlertTriangle } from "lucide-react";
import * as apiClient from "../../api/client";
import type { ResourceInventory } from "../../types";

const LOW_STOCK_THRESHOLD = 20;

export function StockRadar() {
  const [resources, setResources] = useState<ResourceInventory[]>([]);

  async function load() {
    try {
      const data = await apiClient.fetchResources();
      setResources(data);
    } catch {
      /* backend unreachable */
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const hubGroups = resources.reduce<Record<string, ResourceInventory[]>>((acc, r) => {
    (acc[r.location_hub] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Radar className="h-5 w-5 text-emergency-red" />
        <div>
          <h1 className="text-2xl font-bold">Resource Availability</h1>
          <p className="text-sm text-slate-400">
            Nearby shelters, distribution hubs, and real-time stock levels.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(hubGroups).map(([hub, items]) => (
          <div key={hub} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 font-semibold">{hub}</h2>
            <div className="space-y-2">
              {items.map((r) => {
                const low = r.available_units < LOW_STOCK_THRESHOLD;
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      low ? "bg-amber-950/40 text-amber-300" : "bg-slate-950"
                    }`}
                  >
                    <span className="capitalize">{r.resource_type.replace("_", " ")}</span>
                    <span className="flex items-center gap-1 font-medium">
                      {low && <AlertTriangle className="h-3.5 w-3.5" />}
                      {r.available_units} units
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <p className="text-sm text-slate-600">No stock data available right now.</p>
        )}
      </div>
    </div>
  );
}
