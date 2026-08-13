import React, { useMemo } from "react";
import {
  AreaChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import clsx from "clsx";
import { GlassCard } from "../common/GlassCard";
import { tempToThermal } from "../../utils/thermalColors";
import { weatherIcon } from "../../data/indiaWeatherCities";
import type { CityWeather } from "../../hooks/useWeatherForecast";

export function HourlyForecastChart({ city }: { city: CityWeather | null }) {
  const data = useMemo(() => {
    if (!city) return [];
    return city.hourly.map((h) => ({
      time: new Date(h.time).toLocaleTimeString("en-IN", { hour: "numeric", hour12: true }),
      temp: h.temp,
      color: tempToThermal(h.temp).color,
    }));
  }, [city]);

  if (!city) {
    return (
      <GlassCard className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Select a city to view hourly forecast</p>
      </GlassCard>
    );
  }

  const gradId = `weatherGrad-${city.id}`;
  const minTemp = Math.min(...data.map((d) => d.temp));
  const maxTemp = Math.max(...data.map((d) => d.temp));
  const rangeLabel = `${minTemp}° – ${maxTemp}°`;

  return (
    <GlassCard className="weather-chart-card flex h-full flex-col p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">
            24-Hour Forecast — {city.name}
          </h3>
          <p className="text-[10px] text-slate-500">Hourly temperature trend · {rangeLabel}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="time" stroke="#64748b" fontSize={9} interval={3} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={10} unit="°" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#0F172A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v}°C`, "Temperature"]}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="none"
            fill={`url(#${gradId})`}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#38BDF8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#38BDF8", stroke: "#0F172A", strokeWidth: 2 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

export function WeeklyForecastRow({ city }: { city: CityWeather | null }) {
  if (!city) return null;

  return (
    <GlassCard className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-300">7-Day Forecast — {city.name}</h3>
      <div className="grid grid-cols-7 gap-2">
        {city.daily.map((d) => {
          const thermal = tempToThermal(d.max);
          const day = new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" });
          const isHot = thermal.level === "hot" || thermal.level === "extreme";
          return (
            <div
              key={d.date}
              className={clsx(
                "rounded-lg border border-white/5 bg-white/[0.02] p-2 text-center transition-colors",
                isHot && "border-red-500/20 bg-red-500/[0.04]"
              )}
            >
              <p className="text-[10px] text-slate-500">{day}</p>
              <p className="my-1 text-lg">{weatherIcon(d.code)}</p>
              <p className="text-sm font-bold tabular-nums" style={{ color: thermal.color }}>{d.max}°</p>
              <p className="text-[10px] tabular-nums text-slate-500">{d.min}°</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
