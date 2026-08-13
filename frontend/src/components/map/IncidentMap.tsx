import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { Incident } from "../../types";

const LEVEL_COLOR: Record<string, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#FBBF24",
  low: "#10B981",
};

export function IncidentMap({
  incidents,
  onSelect,
}: {
  incidents: Incident[];
  onSelect?: (incident: Incident) => void;
}) {
  const center: [number, number] =
    incidents.length > 0 ? incidents[0].coordinates : [22.9734, 78.6569];

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-800">
      <MapContainer center={center} zoom={5} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {incidents.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={inc.coordinates}
            radius={8 + Math.min(inc.priority_score / 10, 8)}
            pathOptions={{
              color: LEVEL_COLOR[inc.priority_level] ?? "#94A3B8",
              fillColor: LEVEL_COLOR[inc.priority_level] ?? "#94A3B8",
              fillOpacity: 0.6,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelect?.(inc) }}
          >
            <Popup>
              <div className="text-sm text-slate-900">
                <p className="font-semibold">{inc.name}</p>
                <p className="capitalize">{inc.disaster_type} — {inc.priority_level} priority</p>
                <p>Priority score: {inc.priority_score}</p>
                <p>Affected: {inc.affected_count.toLocaleString()}</p>
                <p className="capitalize">Status: {inc.status.replace("_", " ")}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
