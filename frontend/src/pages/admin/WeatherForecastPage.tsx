import React, { useState } from "react";
import { RefreshCw, CloudSun, Radio } from "lucide-react";
import { useWeatherForecast } from "../../hooks/useWeatherForecast";
import { ThermalWeatherMap } from "../../components/weather/ThermalWeatherMap";
import { CityWeatherCard } from "../../components/weather/CityWeatherCard";
import { HourlyForecastChart, WeeklyForecastRow } from "../../components/weather/WeatherCharts";
import { tempToThermal } from "../../utils/thermalColors";
import { ThermalAnimatedScale } from "../../components/weather/ThermalAnimatedScale";
import clsx from "clsx";

export function WeatherForecastPage({ compact = false }: { compact?: boolean }) {
  const { cities, loading, live, lastUpdated, error, refresh } = useWeatherForecast();
  const [selectedId, setSelectedId] = useState("hyderabad");
  const selected = cities.find((c) => c.id === selectedId) ?? cities[0] ?? null;

  const avgTemp = cities.length
    ? Math.round(cities.reduce((s, c) => s + c.temperature, 0) / cities.length)
    : 0;
  const hottest = cities.length ? cities.reduce((a, b) => (a.temperature > b.temperature ? a : b)) : null;
  const coolest = cities.length ? cities.reduce((a, b) => (a.temperature < b.temperature ? a : b)) : null;

  return (
    <div className={clsx("space-y-4 overflow-y-auto", compact ? "p-3" : "p-5")}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-accent-cyan" />
            <h1 className="text-xl font-bold text-white">Live Weather Forecast</h1>
            <span className={clsx(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              live ? "border-emergency-emerald/30 bg-emergency-emerald/10 text-emergency-emerald" : "border-emergency-amber/30 bg-emergency-amber/10 text-emergency-amber"
            )}>
              <Radio className="h-3 w-3" />{live ? "Live Data" : "Simulated"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time weather & thermal indication across India · IMD-aligned zones
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-slate-500">
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-emergency-amber/30 bg-emergency-amber/10 px-3 py-2 text-xs text-emergency-amber">
          {error}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase text-slate-500">India Avg</p>
          <p className="text-2xl font-bold" style={{ color: tempToThermal(avgTemp).color }}>{avgTemp}°C</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase text-slate-500">Hottest</p>
          <p className="text-lg font-bold text-emergency-red">{hottest?.name ?? "—"}</p>
          <p className="text-xs text-slate-400">{hottest ? `${hottest.temperature}°C` : ""}</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase text-slate-500">Coolest</p>
          <p className="text-lg font-bold text-accent-blue">{coolest?.name ?? "—"}</p>
          <p className="text-xs text-slate-400">{coolest ? `${coolest.temperature}°C` : ""}</p>
        </div>
      </div>

      {/* Animated thermal scale */}
      <ThermalAnimatedScale compact={compact} />

      {/* Main grid */}
      <div className={clsx("grid gap-4", compact ? "grid-cols-1" : "lg:grid-cols-12")}>
        <div className={clsx(compact ? "" : "lg:col-span-7 min-h-[400px]")}>
          {loading && cities.length === 0 ? (
            <div className="glass-card flex h-96 items-center justify-center rounded-xl">
              <RefreshCw className="h-8 w-8 animate-spin text-accent-cyan" />
            </div>
          ) : (
            <ThermalWeatherMap
              cities={cities}
              selectedId={selectedId}
              onSelectCity={setSelectedId}
            />
          )}
        </div>

        <div className={clsx("space-y-2 overflow-y-auto", compact ? "max-h-64" : "lg:col-span-5 max-h-[520px]")}>
          {cities.map((city) => (
            <CityWeatherCard
              key={city.id}
              city={city}
              selected={city.id === selectedId}
              onClick={() => setSelectedId(city.id)}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HourlyForecastChart city={selected} />
        {!compact && <WeeklyForecastRow city={selected} />}
      </div>
      {compact && selected && <WeeklyForecastRow city={selected} />}
    </div>
  );
}
