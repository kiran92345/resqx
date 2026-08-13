import React, { useEffect, useState } from "react";
import { MetricCard } from "../../components/common/KPICard";
import { DashboardMap } from "../../components/map/DashboardMap";
import { RecentAlertsPanel } from "../../components/admin/RecentAlertsPanel";
import { ResourceDonutChart } from "../../components/charts/ResourceDonutChart";
import { AIRiskHeatmap } from "../../components/charts/AIRiskHeatmap";
import { IncidentTrendChart } from "../../components/charts/IncidentTrendChart";
import { AIRecommendations } from "../../components/admin/AIRecommendations";
import { IncidentTrackingPanel } from "../../components/incident/IncidentTrackingPanel";
import { fromApiIncident } from "../../data/incidentTracking";
import type { TrackableIncident } from "../../data/incidentTracking";
import { MOCK_KPIS } from "../../data/mockDashboard";
import * as apiClient from "../../api/client";
import type { Incident } from "../../types";

type KpiItem = {
  label: string;
  value: string | number;
  indicator?: string;
  up?: boolean;
  badge?: string;
  theme: string;
  format?: string;
  icon?: import("../../components/common/KPICard").MetricIcon;
  trendGood?: boolean;
};

export function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tracking, setTracking] = useState<TrackableIncident | null>(null);
  const [kpis, setKpis] = useState<KpiItem[]>(MOCK_KPIS);

  useEffect(() => {
    async function load() {
      try {
        const inc = await apiClient.fetchIncidents();
        setIncidents(inc);
        const k = await apiClient.fetchKPIs();
        setKpis([
          { ...MOCK_KPIS[0], value: k.active_disasters },
          { ...MOCK_KPIS[1], value: 1245 },
          { ...MOCK_KPIS[2], value: `${k.resource_fulfillment_rate_pct}%` },
          { ...MOCK_KPIS[3], value: 15 },
          MOCK_KPIS[4],
        ]);
      } catch { /* use mock data */ }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setKpis((prev) => prev.map((k, i) => {
        if (i === 0 && typeof k.value === "number") return { ...k, value: k.value + (Math.random() > 0.7 ? 1 : 0) };
        if (i === 1 && typeof k.value === "number") return { ...k, value: k.value + (Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0) };
        return k;
      }));
    }, 8000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="dashboard-page mx-auto space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-5 md:p-6">
      {/* KPI metrics */}
      <section className="kpi-neuro-grid">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((k) => (
            <MetricCard
              key={k.label}
              label={k.label}
              value={k.value}
              indicator={k.indicator}
              up={k.up}
              badge={k.badge}
              theme={k.theme}
              format={k.format}
              icon={k.icon}
              trendGood={k.trendGood}
            />
          ))}
        </div>
      </section>

      {/* Main row: map + alerts + resources */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="min-h-[300px] sm:min-h-[440px] lg:col-span-5">
          <DashboardMap
            incidents={incidents}
            onTrack={setTracking}
            onSelect={(inc) => setTracking(fromApiIncident(inc))}
          />
        </div>
        <div className="min-h-[300px] sm:min-h-[440px] lg:col-span-3">
          <RecentAlertsPanel onTrack={setTracking} />
        </div>
        <div className="min-h-[300px] sm:min-h-[440px] lg:col-span-4">
          <ResourceDonutChart />
        </div>
      </section>

      {/* Analytics row */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="min-h-[280px] sm:min-h-[380px]"><AIRiskHeatmap /></div>
        <div className="min-h-[280px] sm:min-h-[380px]"><IncidentTrendChart /></div>
        <div className="min-h-[280px] sm:min-h-[380px]"><AIRecommendations /></div>
      </section>

      {tracking && (
        <IncidentTrackingPanel incident={tracking} onClose={() => setTracking(null)} />
      )}
    </div>
  );
}
