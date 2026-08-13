import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Car, AlertTriangle, Flame, Wind, ChevronRight, Heart, Bell } from "lucide-react";
import { GlassCard } from "../../components/common/GlassCard";
import { fromApiIncident } from "../../data/incidentTracking";
import { useTracking } from "../../context/TrackingContext";
import { getAllUserIncidents } from "../../services/userEmergencyStore";
import type { Incident } from "../../types";
import clsx from "clsx";
import { UserPageHeader } from "../../components/user/UserPageHeader";

const ICONS: Record<string, typeof Car> = {
  accident: Car, flood: AlertTriangle, fire: Flame, gas: Wind, outbreak: Heart, other: AlertTriangle,
};
const COLORS: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-emergency-amber/15 text-emergency-amber border-emergency-amber/30",
  medium: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  low: "bg-emergency-emerald/15 text-emergency-emerald border-emergency-emerald/30",
};

export function AlertsScreen() {
  const { startTracking } = useTracking();
  const navigate = useNavigate();
  const location = useLocation();
  const [mine, setMine] = useState<Incident[]>([]);

  useEffect(() => {
    setMine(getAllUserIncidents().filter((i) => i.status !== "resolved"));
  }, [location.pathname]);

  function openTracking(incident: Incident) {
    startTracking(fromApiIncident(incident));
    localStorage.setItem("resqx_last_incident", incident.id);
    navigate("/user/track");
  }

  return (
    <div>
      <UserPageHeader title="My Alerts" subtitle="Updates on emergencies you reported." />

      {mine.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Bell className="h-10 w-10 text-[var(--text-faint)]" />
          <p className="text-[var(--text-muted)]">No active alerts from your reports.</p>
          <p className="text-sm text-[var(--text-faint)]">Press SOS on Home to report an emergency.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {mine.map((inc) => {
            const iconKey = inc.disaster_type === "fire" ? "fire" : inc.disaster_type === "flood" ? "flood" : inc.disaster_type === "outbreak" ? "outbreak" : "accident";
            const Icon = ICONS[iconKey] ?? AlertTriangle;
            return (
              <button key={inc.id} type="button" onClick={() => openTracking(inc)} className="w-full text-left">
                <GlassCard className="p-4 transition hover:border-accent-cyan/30">
                  <div className="flex gap-3">
                    <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border", COLORS[inc.priority_level] ?? COLORS.medium)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-semibold text-[var(--text-primary)]">{inc.name}</h3>
                        <span className="shrink-0 text-[11px] text-[var(--text-faint)]">
                          {new Date(inc.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)] capitalize">{inc.status.replace("_", " ")} · {inc.priority_level} priority</p>
                      <p className="mt-2 flex items-center gap-1 text-[10px] font-medium text-accent-cyan">
                        Track my emergency <ChevronRight className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
