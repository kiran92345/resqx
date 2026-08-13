import React, { useEffect, useMemo, useState } from "react";
import { Search, Brain } from "lucide-react";
import { PriorityBadge } from "../../components/common/KPICard";
import { XAIDrawer } from "../../components/xai/XAIDrawer";
import * as apiClient from "../../api/client";
import type { Incident, RequestStatus } from "../../types";

const STATUS_OPTIONS: RequestStatus[] = [
  "submitted",
  "in_review",
  "dispatched",
  "in_transit",
  "delivered",
  "resolved",
];

export function IncidentTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Incident | null>(null);

  async function load() {
    const data = await apiClient.fetchIncidents();
    setIncidents(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return incidents
      .filter((i) => (typeFilter === "all" ? true : i.disaster_type === typeFilter))
      .filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.priority_score - a.priority_score);
  }, [incidents, query, typeFilter]);

  async function handleStatusChange(id: string, status: RequestStatus) {
    await apiClient.updateIncidentStatus(id, status);
    load();
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Affected Zones</h1>
        <p className="text-sm text-slate-400">All submitted zones, sorted by priority score.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search zone name..."
            className="bg-transparent text-sm outline-none placeholder:text-slate-600"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="all">All disaster types</option>
          <option value="flood">Flood</option>
          <option value="fire">Fire</option>
          <option value="earthquake">Earthquake</option>
          <option value="outbreak">Outbreak</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Affected</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">XAI</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => (
              <tr key={inc.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                <td className="px-4 py-3 font-medium">{inc.name}</td>
                <td className="px-4 py-3 capitalize text-slate-400">{inc.disaster_type}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PriorityBadge level={inc.priority_level} />
                    <span className="text-slate-500">{inc.priority_score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{inc.affected_count.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={inc.status}
                    onChange={(e) => handleStatusChange(inc.id, e.target.value as RequestStatus)}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(inc)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-emergency-red"
                  >
                    <Brain className="h-3.5 w-3.5" /> Why?
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                  No matching zones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <XAIDrawer incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
