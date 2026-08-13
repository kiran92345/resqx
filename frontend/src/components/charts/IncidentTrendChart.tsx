import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { MOCK_TREND_WEEK, MOCK_TREND_MONTH } from "../../data/mockDashboard";
import { DashboardPanel, DashboardSelect } from "../admin/DashboardPanel";

export function IncidentTrendChart() {
  const [range, setRange] = useState<"week" | "month">("week");
  const data = range === "week" ? MOCK_TREND_WEEK : MOCK_TREND_MONTH;
  const total = range === "week" ? 168 : 343;
  const resolved = range === "week" ? 144 : 298;
  const active = total - resolved;

  return (
    <DashboardPanel
      icon={TrendingUp}
      iconTheme="cyan"
      title="Incident Trend"
      subtitle="Volume over time"
      action={
        <DashboardSelect value={range} onChange={(e) => setRange(e.target.value as "week" | "month")}>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </DashboardSelect>
      }
    >
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
          <XAxis dataKey="day" stroke="var(--text-faint)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-faint)" fontSize={10} tickLine={false} axisLine={false} width={28} />
          <Tooltip
            contentStyle={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="incidents"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#3B82F6" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="dashboard-stat-row mt-2">
        <div>
          <p className="dashboard-stat-value">{total}</p>
          <p className="dashboard-stat-label">Total</p>
        </div>
        <div>
          <p className="dashboard-stat-value text-emergency-emerald">{resolved}</p>
          <p className="dashboard-stat-label">Resolved</p>
        </div>
        <div>
          <p className="dashboard-stat-value text-emergency-red">{active}</p>
          <p className="dashboard-stat-label">Active</p>
        </div>
      </div>
    </DashboardPanel>
  );
}
