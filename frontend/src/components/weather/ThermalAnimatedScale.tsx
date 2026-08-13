import React from "react";
import { THERMAL_LEGEND } from "../../utils/thermalColors";

const TEMP_TICKS = [10, 15, 20, 25, 30, 35, 40, 45];

export function ThermalAnimatedScale({ compact = false }: { compact?: boolean }) {
  return (
    <div className="glass-card weather-scale-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Temperature Scale
          </p>
          <p className="text-[10px] text-slate-600">Standard thermal classification (°C)</p>
        </div>
        <span className="weather-live-badge flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <span className="weather-live-dot h-1.5 w-1.5 rounded-full bg-emergency-emerald" />
          Updated live
        </span>
      </div>

      <div className="relative">
        <div
          className="weather-scale-gradient h-3 w-full rounded-full"
          aria-hidden
        />
        <div className="mt-1.5 flex justify-between px-0.5">
          {TEMP_TICKS.map((t) => (
            <span key={t} className="text-[9px] tabular-nums text-slate-500">
              {compact && t % 10 !== 0 ? "" : `${t}°`}
            </span>
          ))}
        </div>
      </div>

      <div className={`mt-3 grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-5 gap-3"}`}>
        {THERMAL_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20"
              style={{ background: l.color }}
            />
            <span className="text-[10px] leading-tight text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
