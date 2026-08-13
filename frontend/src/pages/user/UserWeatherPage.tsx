import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import clsx from "clsx";
import { useWeatherForecast } from "../../hooks/useWeatherForecast";
import { CityWeatherCard } from "../../components/weather/CityWeatherCard";
import { HourlyForecastChart } from "../../components/weather/WeatherCharts";
import { UserPageHeader } from "../../components/user/UserPageHeader";

export function UserWeatherPage() {
  const { cities, loading, lastUpdated, refresh } = useWeatherForecast();
  const [selectedId, setSelectedId] = useState("hyderabad");
  const selected = cities.find((c) => c.id === selectedId) ?? cities[0] ?? null;
  const nearby = cities.slice(0, 4);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <UserPageHeader
          className="mb-0 flex-1"
          title="Local Weather"
          subtitle={
            lastUpdated
              ? `Conditions near you · Updated ${lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
              : "Conditions near you — useful for flood, fire, and travel emergencies."
          }
        />
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CityWeatherCard city={selected} selected onClick={() => setSelectedId(selected.id)} />
          {selected.hourly.length > 0 && (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Next 24 hours — {selected.name}</h2>
              <HourlyForecastChart city={selected} />
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Other cities</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {nearby.map((c) => (
            <CityWeatherCard
              key={c.id}
              city={c}
              selected={c.id === selectedId}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
