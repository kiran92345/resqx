import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GlassCard } from "../../components/common/GlassCard";
import { getAllUserIncidents } from "../../services/userEmergencyStore";
import type { Incident } from "../../types";
import { UserPageHeader } from "../../components/user/UserPageHeader";

export function EmergencyHistoryScreen() {
  const location = useLocation();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setIncidents(getAllUserIncidents());
  }, [location.pathname]);

  return (
    <div>
      <UserPageHeader title="My Emergency History" subtitle="Only emergencies you reported through this account." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {incidents.map((inc) => (
          <GlassCard key={inc.id} className="p-4">
            <p className="font-semibold text-[var(--text-primary)]">{inc.name}</p>
            <p className="text-xs capitalize text-[var(--text-muted)]">{inc.disaster_type}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--text-faint)]">
              <span className="rounded bg-[var(--surface-muted)] px-2 py-0.5 capitalize">{inc.status.replace("_", " ")}</span>
              <span>{new Date(inc.timestamp).toLocaleString()}</span>
              <span className="capitalize">{inc.priority_level} priority</span>
            </div>
          </GlassCard>
        ))}
        {incidents.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-[var(--text-muted)]">
            No history yet. Your SOS reports will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
