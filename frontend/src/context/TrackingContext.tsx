import React, { createContext, useContext, useState, useCallback } from "react";
import type { TrackableIncident } from "../data/incidentTracking";

interface TrackingContextValue {
  tracking: TrackableIncident | null;
  startTracking: (incident: TrackableIncident) => void;
  stopTracking: () => void;
}

const TrackingContext = createContext<TrackingContextValue | undefined>(undefined);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [tracking, setTracking] = useState<TrackableIncident | null>(() => {
    const raw = localStorage.getItem("resqx_tracking");
    return raw ? JSON.parse(raw) : null;
  });

  const startTracking = useCallback((incident: TrackableIncident) => {
    setTracking(incident);
    localStorage.setItem("resqx_tracking", JSON.stringify(incident));
    localStorage.setItem("resqx_last_incident", incident.id);
  }, []);

  const stopTracking = useCallback(() => {
    setTracking(null);
    localStorage.removeItem("resqx_tracking");
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
