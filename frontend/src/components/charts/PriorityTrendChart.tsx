import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TrendPoint {
  disaster_type: string;
  avg_priority: number;
  count: number;
}

const COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#A855F7", "#10B981"];

export function PriorityTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64 w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">
        Average Priority by Disaster Type
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="disaster_type" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
          />
          <Bar dataKey="avg_priority" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
