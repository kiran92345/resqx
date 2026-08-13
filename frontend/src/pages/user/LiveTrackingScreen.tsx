import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTracking } from "../../context/TrackingContext";
import { IncidentTrackingPanel } from "../../components/incident/IncidentTrackingPanel";
import { fromApiIncident } from "../../data/incidentTracking";
import { resolveUserIncident } from "../../services/userEmergencyStore";
import { MapPin } from "lucide-react";
import { UserPageHeader } from "../../components/user/UserPageHeader";

export function LiveTrackingScreen() {
  const location = useLocation();
  const { tracking, startTracking } = useTracking();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setError(false);

    const id = localStorage.getItem("resqx_last_incident");
    if (!id) {
      setLoaded(true);
      return;
    }

    resolveUserIncident(id)
      .then((inc) => {
        if (cancelled) return;
        if (inc) {
          startTracking(fromApiIncident(inc));
        } else {
          setError(true);
        }
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoaded(true); });

    return () => { cancelled = true; };
  }, [location.pathname, startTracking]);

  if (!loaded) {
    return (
      <>
        <UserPageHeader title="Live GPS Tracking" subtitle="Loading your emergency route…" />
        <p className="text-sm text-[var(--text-muted)]">Please wait…</p>
      </>
    );
  }

  if (!tracking) {
    return (
      <>
        <UserPageHeader title="Live GPS Tracking" subtitle="Track responder route to your location" />
        <div className="flex flex-col items-center gap-3 py-12 text-center">
        <MapPin className="h-12 w-12 text-[var(--text-faint)]" />
        <p className="text-[var(--text-muted)]">
          {error ? "Could not load incident tracking." : "No active incident to track."}
        </p>
        <p className="text-sm text-[var(--text-faint)]">Press SOS on Home to report an emergency first.</p>
        </div>
      </>
    );
  }

  return (
    <div>
      <UserPageHeader
        title="Live GPS Tracking"
        subtitle={`Satellite view · ${tracking.city}, ${tracking.state}`}
      />
      <IncidentTrackingPanel incident={tracking} />
    </div>
  );
}
