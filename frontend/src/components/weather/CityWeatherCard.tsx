import React from "react";
import { Droplets, Wind, Thermometer } from "lucide-react";
import { GlassCard } from "../common/GlassCard";
import { tempToThermal } from "../../utils/thermalColors";
import { weatherIcon, weatherLabel } from "../../data/indiaWeatherCities";
import type { CityWeather } from "../../hooks/useWeatherForecast";
import clsx from "clsx";

export function CityWeatherCard({
  city,
  selected,
  onClick,
}: {
  city: CityWeather;
  selected?: boolean;
  onClick?: () => void;
}) {
  const thermal = tempToThermal(city.temperature);
  const barPct = Math.min(100, ((city.temperature - 10) / 35) * 100);

  return (
    <button onClick={onClick} className="w-full text-left">
      <GlassCard
        className={clsx(
          "weather-city-card p-4 transition-all duration-300",
          selected && "ring-2 ring-accent-cyan/50 shadow-glow-blue",
          onClick && "hover:border-white/15"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-white">{city.name}</p>
            <p className="text-[10px] text-slate-500">{city.state}</p>
          </div>
          <span className="text-xl">{weatherIcon(city.weatherCode)}</span>
        </div>

        <div className="mt-2 flex items-end gap-2">
          <span
            className="text-3xl font-black tabular-nums transition-colors duration-500"
            style={{ color: thermal.color }}
          >
            {city.temperature}°
          </span>
          <span
            className="mb-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
            style={{ background: thermal.color }}
          >
            {thermal.label}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-400">{weatherLabel(city.weatherCode)}</p>

        <div className="mt-3 flex gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" />Feels {city.feelsLike}°</span>
          <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{city.humidity}%</span>
          <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{city.windSpeed} km/h</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="weather-bar-fill h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${barPct}%`,
              background: `linear-gradient(90deg, #3B82F6 0%, #10B981 35%, #F59E0B 65%, ${thermal.color} 100%)`,
            }}
          />
        </div>
      </GlassCard>
    </button>
  );
}
