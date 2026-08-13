import React, { useState } from "react";
import { Brain } from "lucide-react";
import { INDIA_RISK_AREAS } from "../../data/indiaLocations";
import { DashboardPanel, DashboardSelect } from "../admin/DashboardPanel";

export function AIRiskHeatmap() {
  const [timeframe, setTimeframe] = useState("72h");

  const grid = Array.from({ length: 48 }, (_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const hotspot1 = Math.sqrt((row - 1) ** 2 + (col - 2) ** 2) < 1.5;
    const hotspot2 = Math.sqrt((row - 4) ** 2 + (col - 5) ** 2) < 1.2;
    const hotspot3 = Math.sqrt((row - 2) ** 2 + (col - 6) ** 2) < 1.0;
    if (hotspot1 || hotspot2 || hotspot3) return 0.85 + (i % 3) * 0.05;
    return 0.15 + (i % 5) * 0.08;
  });

  function cellColor(v: number) {
    if (v > 0.8) return "#EF4444";
    if (v > 0.6) return "#F59E0B";
    if (v > 0.4) return "#3B82F6";
    return "#1e3a5f";
  }

  return (
    <DashboardPanel
      icon={Brain}
      iconTheme="purple"
      title="AI Risk Prediction"
      subtitle="Forecast heatmap by zone"
      action={
        <DashboardSelect value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          <option value="24h">Next 24 Hours</option>
          <option value="72h">Next 72 Hours</option>
          <option value="7d">Next 7 Days</option>
        </DashboardSelect>
      }
    >
      <div className="mb-4 grid grid-cols-8 gap-1 overflow-hidden rounded-lg">
        {grid.map((v, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm transition-opacity duration-300"
            style={{
              background: cellColor(v),
              opacity: 0.55 + v * 0.45,
            }}
          />
        ))}
      </div>

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
        High Risk Areas
      </p>
      <div className="space-y-2.5">
        {INDIA_RISK_AREAS.map((area) => (
          <div key={area.rank} className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--text-muted)]">
              {area.rank}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-[var(--text-secondary)]">{area.name}</span>
              <span className="ml-1 text-[10px] text-[var(--text-faint)]">({area.state})</span>
            </div>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emergency-amber to-emergency-red"
                style={{ width: `${area.risk}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
