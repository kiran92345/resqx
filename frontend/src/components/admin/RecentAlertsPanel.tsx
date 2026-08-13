import React, { useState } from "react";
import { Bell, ChevronRight, AlertTriangle } from "lucide-react";
import { SeverityBadge } from "../common/KPICard";
import { INDIA_ALERTS } from "../../data/indiaLocations";
import { getTrackableById } from "../../data/incidentTracking";
import type { TrackableIncident } from "../../data/incidentTracking";
import { DashboardPanel } from "./DashboardPanel";

export function RecentAlertsPanel({ onTrack }: { onTrack?: (t: TrackableIncident) => void }) {
  const [expanded, setExpanded] = useState(false);
  const alerts = expanded ? INDIA_ALERTS : INDIA_ALERTS.slice(0, 5);

  return (
    <DashboardPanel
      icon={Bell}
      iconTheme="orange"
      title="Recent Alerts"
      subtitle="Tap to track incident"
      action={
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-medium text-accent-blue hover:underline"
        >
          {expanded ? "Show Less" : "View All"}
        </button>
      }
      bodyClassName="overflow-y-auto"
    >
      <div className="space-y-2">
        {alerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => {
              const t = getTrackableById(alert.id);
              if (t) onTrack?.(t);
            }}
            className="dashboard-list-item group"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emergency-red/10 text-emergency-red">
                <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{alert.title}</p>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{alert.time}</p>
                {onTrack && (
                  <p className="mt-1.5 flex items-center gap-0.5 text-[11px] font-medium text-accent-blue opacity-80 transition group-hover:opacity-100">
                    Track incident <ChevronRight className="h-3.5 w-3.5" />
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </DashboardPanel>
  );
}
