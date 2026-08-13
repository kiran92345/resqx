import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SupplyDemandPoint {
  resource_type: string;
  supply: number;
  demand: number;
}

export function ResourceSupplyDemandChart({ data }: { data: SupplyDemandPoint[] }) {
  return (
    <div className="h-64 w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">
        Resource Supply vs. Demand
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="resource_type" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
          <Legend />
          <Bar dataKey="supply" fill="#10B981" radius={[4, 4, 0, 0]} name="Supply" />
          <Bar dataKey="demand" fill="#EF4444" radius={[4, 4, 0, 0]} name="Demand" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
