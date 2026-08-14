import React, { createContext, useContext, useState, useCallback } from "react";
import type { TrackableIncident } from "../data/incidentTracking";
import { storageGet, storageSet, storageRemove } from "../utils/safeStorage";

interface TrackingContextValue {
  tracking: TrackableIncident | null;
  startTracking: (incident: TrackableIncident) => void;
  stopTracking: () => void;
}

const TrackingContext = createContext<TrackingContextValue | undefined>(undefined);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [tracking, setTracking] = useState<TrackableIncident | null>(() => {
    const raw = storageGet("resqx_tracking");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as TrackableIncident;
    } catch {
      return null;
    }
  });

  const startTracking = useCallback((incident: TrackableIncident) => {
    setTracking(incident);
    storageSet("resqx_tracking", JSON.stringify(incident));
    storageSet("resqx_last_incident", incident.id);
  }, []);

  const stopTracking = useCallback(() => {
    setTracking(null);
    storageRemove("resqx_tracking");
  }, []);

  return (
    <TrackingContext.Provider value={{ tracking, startTracking, stopTracking }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error("useTracking must be used within TrackingProvider");
  return ctx;
}
