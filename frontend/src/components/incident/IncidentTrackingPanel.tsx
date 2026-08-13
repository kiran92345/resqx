import React, { useEffect, useState } from "react";
import { MapContainer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { X, Ambulance, Satellite, CheckCircle2, Circle } from "lucide-react";
import { StatusPipeline } from "../dispatch/StatusPipeline";
import { MapTileLayer } from "../map/MapTileLayer";
import { GlassCard } from "../common/GlassCard";
import { PriorityBadge } from "../common/KPICard";
import { SEVERITY_LABEL, SEVERITY_COLOR } from "../../data/indiaLocations";
import type { TrackableIncident } from "../../data/incidentTracking";
import clsx from "clsx";

function FlyToIncident({ coords, zoom }: { coords: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(coords, zoom, { animate: true }); }, [map, coords, zoom]);
  return null;
}

const incidentIcon = L.divIcon({
  html: `<div style="background:#EF4444;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px #EF444488"></div>`,
  className: "", iconSize: [18, 18], iconAnchor: [9, 9],
});

function unitIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="background:#3B82F6;width:32px;height:32px;border-radius:8px;border:2px solid #00F0FF;box-shadow:0 0 14px #00F0FF88;display:flex;align-items:center;justify-content:center;font-size:16px">${emoji}</div>`,
    className: "", iconSize: [32, 32], iconAnchor: [16, 16],
  });
}

export function IncidentTrackingPanel({
  incident,
  onClose,
  compact = false,
}: {
  incident: TrackableIncident;
  onClose?: () => void;
  compact?: boolean;
}) {
  const [eta, setEta] = useState(incident.etaMinutes);
  const progress = incident.etaMinutes > 0 ? Math.min((incident.etaMinutes - eta) / incident.etaMinutes, 1) : 1;
  const unitPos = incident.route[Math.min(Math.floor(progress * (incident.route.length - 1)), incident.route.length - 1)];

  useEffect(() => {
    setEta(incident.etaMinutes);
  }, [incident]);

  useEffect(() => {
    if (eta <= 0 || incident.status === "resolved") return;
    const t = setInterval(() => setEta((e) => Math.max(0, e - 1)), 10000);
    return () => clearInterval(t);
  }, [eta, incident.status]);

  const content = (
    <div className={clsx("flex flex-col gap-4", compact ? "" : "lg:flex-row")}>
      {/* Satellite GPS map */}
      <div className={clsx("relative overflow-hidden rounded-xl border border-white/10", compact ? "h-52" : "h-64 lg:h-auto lg:min-h-[320px] lg:flex-1")}>
        <div className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full border border-accent-cyan/40 bg-navy-light/90 px-2.5 py-1 text-[10px] font-semibold text-accent-cyan backdrop-blur">
          <Satellite className="h-3 w-3" /> Satellite GPS
        </div>
        <MapContainer
          center={incident.coordinates}
          zoom={14}
          className="h-full w-full min-h-[208px]"
          zoomControl={!compact}
          attributionControl={false}
        >
          <MapTileLayer variant="satellite" />
          <FlyToIncident coords={incident.coordinates} zoom={14} />
          <Polyline positions={incident.route} pathOptions={{ color: "#FBBF24", weight: 5, opacity: 0.95, dashArray: incident.status === "resolved" ? undefined : "8 6" }} />
          <Marker position={incident.coordinates} icon={incidentIcon}>
            <Popup><strong>Incident</strong><br />{incident.name}</Popup>
          </Marker>
          {incident.status !== "resolved" && (
            <Marker position={unitPos} icon={unitIcon(incident.unitType)}>
              <Popup><strong>{incident.unitLabel}</strong></Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Progress & details */}
      <div className={clsx("space-y-4", compact ? "" : "lg:w-96")}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white">{incident.name}</h3>
              <p className="text-xs text-slate-400">{incident.city}, {incident.state}</p>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: SEVERITY_COLOR[incident.severity] }}
            >
              {SEVERITY_LABEL[incident.severity]}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{incident.description}</p>
        </div>

        {/* Overall progress bar */}
        <div>
          <div className="mb-1 flex justify-between text-[10px]">
            <span className="text-slate-500">Solution Progress</span>
            <span className="font-bold text-emergency-emerald">{incident.progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-emergency-emerald transition-all duration-700"
              style={{ width: `${incident.progressPct}%` }}
            />
          </div>
        </div>

        <GlassCard className="p-3">
          <StatusPipeline current={incident.status} etaMinutes={eta} />
        </GlassCard>

        {/* Solution steps */}
        <GlassCard className="p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Resolution Steps</p>
          <div className="space-y-2">
            {incident.solutionSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                {step.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emergency-emerald" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                )}
                <div className="flex-1">
                  <p className={clsx("text-xs", step.done ? "text-slate-200" : "text-slate-500")}>{step.label}</p>
                  {step.done && <p className="text-[10px] text-slate-600">{step.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {incident.status !== "resolved" && (
          <GlassCard className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/20 text-lg">
                {incident.unitType}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{incident.unitLabel}</p>
                <p className="text-[10px] text-slate-400">{incident.originLabel} → incident</p>
              </div>
            </div>
            {eta > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-emergency-amber">{eta}</p>
                <p className="text-[10px] text-slate-400">min ETA</p>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );

  if (compact) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="glass-card max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ambulance className="h-5 w-5 text-accent-cyan" />
            <h2 className="text-lg font-bold text-white">Incident Live Tracking</h2>
            <PriorityBadge level={incident.severity === "critical" ? "critical" : incident.severity === "high" ? "high" : incident.severity === "medium" ? "medium" : "low"} />
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {content}
      </div>
    </div>
  );
}
