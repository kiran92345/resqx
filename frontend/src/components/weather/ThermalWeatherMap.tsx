import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Crosshair, Layers } from "lucide-react";
import { INDIA_CENTER, INDIA_ZOOM } from "../../data/indiaLocations";
import { tempToThermal, THERMAL_LEGEND } from "../../utils/thermalColors";
import { buildThermalHeatmapUrl, THERMAL_MAP_BOUNDS } from "../../utils/thermalHeatmap";
import type { CityWeather } from "../../hooks/useWeatherForecast";
import { ThemedTileLayer } from "../map/ThemedTileLayer";
import { GlassCard } from "../common/GlassCard";
import clsx from "clsx";

function RecenterButton() {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(INDIA_CENTER, INDIA_ZOOM)}
      className="map-control-btn absolute right-3 top-12 z-[1000] flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur"
      aria-label="Recenter map"
    >
      <Crosshair className="h-4 w-4" />
    </button>
  );
}

function cityMarkerIcon(temp: number, selected: boolean) {
  const t = tempToThermal(temp);
  return L.divIcon({
    html: `
      <div class="weather-marker ${selected ? "weather-marker-selected" : ""}">
        <span class="weather-marker-stem" style="background:${t.color}"></span>
        <span class="weather-marker-chip" style="border-color:${t.color};color:${t.color}">
          ${temp}°
        </span>
      </div>
    `,
    className: "weather-marker-wrap",
    iconSize: [52, 36],
    iconAnchor: [26, 36],
  });
}

function ThermalOverlay({ url, visible, fadeKey }: { url: string; visible: boolean; fadeKey: number }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (!url || !visible) {
      setOpacity(0);
      return;
    }
    setOpacity(0);
    const id = window.requestAnimationFrame(() => setOpacity(0.62));
    return () => window.cancelAnimationFrame(id);
  }, [url, visible, fadeKey]);

  if (!url || !visible) return null;
  return <ImageOverlay url={url} bounds={THERMAL_MAP_BOUNDS} opacity={opacity} />;
}

export function ThermalWeatherMap({
  cities,
  selectedId,
  onSelectCity,
}: {
  cities: CityWeather[];
  selectedId?: string;
  onSelectCity?: (id: string) => void;
}) {
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [heatmapUrl, setHeatmapUrl] = useState("");
  const [fadeKey, setFadeKey] = useState(0);

  const readings = useMemo(
    () => cities.map((c) => ({ lat: c.coordinates[0], lng: c.coordinates[1], temp: c.temperature })),
    [cities]
  );

  useEffect(() => {
    if (readings.length === 0) return;
    const url = buildThermalHeatmapUrl(readings);
    setHeatmapUrl(url);
    setFadeKey((k) => k + 1);
  }, [readings]);

  return (
    <GlassCard className="weather-map-card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Temperature Map — India</h3>
          <p className="text-[10px] text-slate-500">Interpolated thermal overlay from live station readings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOverlayVisible((v) => !v)}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition",
              overlayVisible
                ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                : "border-white/10 bg-white/5 text-slate-400"
            )}
          >
            <Layers className="h-3 w-3" />
            Heatmap
          </button>
          <span className="weather-live-badge flex items-center gap-1.5 rounded-full border border-emergency-emerald/30 bg-emergency-emerald/10 px-2.5 py-0.5 text-[10px] font-semibold text-emergency-emerald">
            <span className="weather-live-dot h-1.5 w-1.5 rounded-full bg-emergency-emerald" />
            Live
          </span>
        </div>
      </div>

      <div className="weather-map-viewport relative min-h-[360px] flex-1">
        <MapContainer center={INDIA_CENTER} zoom={INDIA_ZOOM} className="h-full w-full" scrollWheelZoom minZoom={4}>
          <ThemedTileLayer />
          <RecenterButton />
          <ThermalOverlay url={heatmapUrl} visible={overlayVisible} fadeKey={fadeKey} />

          {cities.map((city) => {
            const thermal = tempToThermal(city.temperature);
            const selected = city.id === selectedId;
            return (
              <Marker
                key={city.id}
                position={city.coordinates}
                icon={cityMarkerIcon(city.temperature, selected)}
                eventHandlers={{
                  click: () => onSelectCity?.(city.id),
                }}
              >
                <Popup>
                  <div className="min-w-[160px] text-sm text-slate-900">
                    <p className="font-bold">{city.name}, {city.state}</p>
                    <p className="text-2xl font-black" style={{ color: thermal.color }}>
                      {city.temperature}°C
                    </p>
                    <p className="text-xs text-slate-600">{thermal.label} · Feels {city.feelsLike}°C</p>
                    <p className="mt-1 text-xs">Humidity {city.humidity}% · Wind {city.windSpeed} km/h</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/5 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Legend</span>
        {THERMAL_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="h-2.5 w-5 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
