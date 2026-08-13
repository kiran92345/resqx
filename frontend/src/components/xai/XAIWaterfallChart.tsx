import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { ShapFactor } from "../../types";

export function XAIWaterfallChart({ factors, score }: { factors: ShapFactor[]; score: number }) {
  const sorted = [...factors].sort((a, b) => Math.abs(b.contribution_pct) - Math.abs(a.contribution_pct));
  const maxAbs = Math.max(...sorted.map((f) => Math.abs(f.contribution_pct)), 1);

  const data = sorted.map((f) => ({
    name: f.label.length > 28 ? `${f.label.slice(0, 26)}…` : f.label,
    fullName: f.label,
    value: f.contribution_pct,
    fill: f.direction === "increase" ? "#EF4444" : "#10B981",
  }));

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          SHAP-style factor breakdown
        </p>
        <p className="text-2xl font-bold text-white">
          {score}
          <span className="ml-1 text-sm font-normal text-slate-500">/100</span>
        </p>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={10} domain={[-maxAbs * 1.1, maxAbs * 1.1]} />
          <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={120} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#0F172A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v > 0 ? "+" : ""}${v} pts`, "Contribution"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={600}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-[10px] text-slate-600">
        Red bars increase priority; green bars decrease it. Values sum to the final score.
      </p>
    </div>
  );
}
