import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { GlassCard } from "../common/GlassCard";
import type { AggregateFeature } from "../../types/xai";

export function FeatureImportanceChart({ features }: { features: AggregateFeature[] }) {
  const data = features.slice(0, 8).map((f) => ({
    name: f.label.length > 22 ? `${f.label.slice(0, 20)}…` : f.label,
    fullName: f.label,
    avg: f.avg_contribution,
    count: f.incident_count,
  }));

  if (data.length === 0) {
    return (
      <GlassCard className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">No feature data available</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex h-full flex-col p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-300">Global Feature Importance</h3>
      <p className="mb-3 text-[10px] text-slate-500">
        Average absolute contribution across all analyzed incidents
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={8}
            angle={-35}
            textAnchor="end"
            height={56}
            interval={0}
          />
          <YAxis stroke="#64748b" fontSize={10} unit=" pts" tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#0F172A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v} avg pts`, "Importance"]}
          />
          <Bar dataKey="avg" fill="#38BDF8" radius={[4, 4, 0, 0]} animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
