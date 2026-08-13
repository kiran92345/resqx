import React, { useMemo } from "react";
import { MapContainer, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Crosshair, Plus, Minus, Satellite } from "lucide-react";
import {
  INDIA_CENTER,
  INDIA_ZOOM,
  INDIA_EMERGENCY_LOCATIONS,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  priorityToSeverity,
  type IndiaMapLocation,
} from "../../data/indiaLocations";
import type { Incident } from "../../types";
import type { TrackableIncident } from "../../data/incidentTracking";
import { fromMapLocation, fromApiIncident } from "../../data/incidentTracking";
import { MapTileLayer } from "./MapTileLayer";
import { DashboardPanel, LiveBadge } from "../admin/DashboardPanel";
import { Map } from "lucide-react";

const TYPE_EMOJI: Record<string, string> = {
  hospital: "🏥",
  shelter: "🏠",
  resource: "📦",
  vehicle: "🚑",
  incident: "🚨",
};

const INFRA_COLOR: Record<string, string> = {
  hospital: "#3B82F6",
  shelter: "#10B981",
  resource: "#A855F7",
  vehicle: "#00F0FF",
};

function makeSeverityIcon(severity: string, emoji: string, size = 26) {
  const color = SEVERITY_COLOR[severity as keyof typeof SEVERITY_COLOR] ?? "#94A3B8";
  return L.divIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2.5px solid white;box-shadow:0 0 10px ${color}99">${emoji}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeInfraIcon(type: string, emoji: string) {
  const color = INFRA_COLOR[type] ?? "#64748B";
  return L.divIcon({
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;border:2px solid rgba(255,255,255,0.5)">${emoji}</div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function MapControls({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  return (
    <div className="absolute right-3 top-12 z-[1000] flex flex-col gap-1">
      <button onClick={() => map.zoomIn()} className="map-control-btn flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur"><Plus className="h-4 w-4" /></button>
      <button onClick={() => map.zoomOut()} className="map-control-btn flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur"><Minus className="h-4 w-4" /></button>
      <button onClick={() => map.setView(center, zoom)} className="map-control-btn flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur"><Crosshair className="h-4 w-4" /></button>
    </div>
  );
}

function LocationPopup({ loc, onTrack }: { loc: IndiaMapLocation; onTrack?: (t: TrackableIncident) => void }) {
  const color = loc.type === "incident" ? SEVERITY_COLOR[loc.severity] : INFRA_COLOR[loc.type];
  return (
    <div className="min-w-[180px] text-sm text-slate-900">
      <p className="font-bold">{loc.name}</p>
      <p className="text-xs text-slate-600">{loc.city}, {loc.state}</p>
      {loc.type === "incident" && (
        <>
          <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: color }}>
            {SEVERITY_LABEL[loc.severity]}
          </span>
          {onTrack && (
            <button
              onClick={() => onTrack(fromMapLocation(loc))}
              className="mt-2 w-full rounded-lg bg-accent-blue py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
            >
              Track Incident →
            </button>
          )}
        </>
      )}
      <p className="mt-1 text-xs">{loc.description}</p>
      {loc.affected != null && loc.affected > 0 && <p className="mt-1 text-xs font-medium text-red-600">Affected: {loc.affected}</p>}
    </div>
  );
}

export function DashboardMap({
  incidents,
  onSelect,
  onTrack,
  fullScreen = false,
}: {
  incidents: Incident[];
  onSelect?: (i: Incident) => void;
  onTrack?: (t: TrackableIncident) => void;
  fullScreen?: boolean;
}) {
  const staticLocations = INDIA_EMERGENCY_LOCATIONS;

  const apiMarkers = useMemo(
    () =>
      incidents.map((inc) => ({
        id: inc.id,
        coordinates: inc.coordinates,
        severity: priorityToSeverity(inc.priority_level),
        name: inc.name,
        disaster_type: inc.disaster_type,
        affected: inc.affected_count,
        incident: inc,
      })),
    [incidents]
  );

  return (
    <DashboardPanel
      icon={Map}
      iconTheme="red"
      title="Live Incident Map — India"
      subtitle="Real-time emergency locations"
      action={<LiveBadge />}
      flushBody
      headerBorder
      className="h-full"
      bodyClassName="relative min-h-[320px] flex-1 p-0"
    >
      <div className={`relative h-full ${fullScreen ? "min-h-[calc(100vh-120px)]" : "min-h-[320px]"}`}>
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full border border-accent-cyan/40 bg-[var(--surface-elevated)] px-2.5 py-1 text-[10px] font-semibold text-accent-cyan backdrop-blur">
          <Satellite className="h-3.5 w-3.5" /> Satellite GPS
        </div>
        <MapContainer center={INDIA_CENTER} zoom={INDIA_ZOOM} className="h-full w-full" scrollWheelZoom minZoom={4} maxZoom={19}>
          <MapTileLayer variant="satellite" />
          <MapControls center={INDIA_CENTER} zoom={INDIA_ZOOM} />

          {/* Static India emergency & infrastructure locations */}
          {staticLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.coordinates}
              icon={
                loc.type === "incident"
                  ? makeSeverityIcon(loc.severity, TYPE_EMOJI.incident, loc.severity === "critical" ? 30 : 26)
                  : makeInfraIcon(loc.type, TYPE_EMOJI[loc.type])
              }
              eventHandlers={
                loc.type === "incident" && onTrack
                  ? { click: () => onTrack(fromMapLocation(loc)) }
                  : undefined
              }
            >
              <Popup><LocationPopup loc={loc} onTrack={onTrack} /></Popup>
            </Marker>
          ))}

          {/* API incidents — severity colored circles */}
          {apiMarkers.map((m) => (
            <CircleMarker
              key={m.id}
              center={m.coordinates}
              radius={10}
              pathOptions={{
                color: SEVERITY_COLOR[m.severity],
                fillColor: SEVERITY_COLOR[m.severity],
                fillOpacity: 0.75,
                weight: 3,
              }}
              eventHandlers={{
                click: () => {
                  if (m.incident) {
                    onSelect?.(m.incident);
                    onTrack?.(fromApiIncident(m.incident));
                  }
                },
              }}
            >
              <Popup>
                <div className="text-sm text-slate-900">
                  <p className="font-bold">{m.name}</p>
                  <p className="capitalize text-xs">{m.disaster_type}</p>
                  <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: SEVERITY_COLOR[m.severity] }}>
                    {SEVERITY_LABEL[m.severity]}
                  </span>
                  {m.affected > 0 && <p className="mt-1 text-xs">Affected: {m.affected}</p>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Severity legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border-subtle)] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase text-[var(--text-faint)]">Severity:</span>
        {(["low", "medium", "high", "critical"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEVERITY_COLOR[s] }} />
            {s === "low" ? "Low" : s === "medium" ? "Medium" : s === "high" ? "High" : "Critical"}
          </div>
        ))}
        <span className="mx-1 text-[var(--text-faint)]">|</span>
        {Object.entries(TYPE_EMOJI).filter(([t]) => t !== "incident").map(([type, emoji]) => (
          <div key={type} className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] capitalize">
            <span>{emoji}</span>{type}
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
