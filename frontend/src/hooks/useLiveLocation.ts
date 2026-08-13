import { useCallback, useEffect, useRef, useState } from "react";
import { HYDERABAD_USER_LOCATION } from "../data/indiaLocations";
import {
  enrichLocationLabel,
  fetchCurrentPosition,
  formatCoordinates,
  getGeolocationErrorMessage,
  isGeolocationAvailable,
  reverseGeocode,
  type GeoCoordinates,
} from "../services/geolocation";

export type LiveLocationStatus = "idle" | "detecting" | "ready" | "error";

export function useLiveLocation({
  enabled,
  autoFetch = true,
  initialCoords,
  initialLocation,
}: {
  enabled: boolean;
  autoFetch?: boolean;
  initialCoords?: GeoCoordinates;
  initialLocation?: string;
}) {
  const [coordinates, setCoordinates] = useState<GeoCoordinates>(
    initialCoords ?? HYDERABAD_USER_LOCATION
  );
  const [locationLabel, setLocationLabel] = useState(initialLocation ?? "");
  const [status, setStatus] = useState<LiveLocationStatus>("idle");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsLocked, setGpsLocked] = useState(false);
  const fetchedRef = useRef(false);

  const applyPosition = useCallback(async (lat: number, lng: number, accuracyMeters: number | null) => {
    const coords: GeoCoordinates = [lat, lng];
    setCoordinates(coords);
    setAccuracy(accuracyMeters);
    setGpsLocked(true);
    setStatus("detecting");

    const label = await reverseGeocode(lat, lng);
    setLocationLabel(label ?? formatCoordinates(coords));
    setStatus("ready");
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!isGeolocationAvailable()) {
      setError("Live GPS needs HTTPS (or localhost). Enable location permission or enter address manually.");
      setStatus("error");
      return;
    }

    setStatus("detecting");
    setError(null);

    try {
      const position = await fetchCurrentPosition();
      await applyPosition(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy ?? null
      );
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      const message =
        geoError?.code != null
          ? getGeolocationErrorMessage(geoError.code)
          : err instanceof Error
            ? err.message
            : "Could not detect live location.";
      setError(message);
      setStatus("error");
    }
  }, [applyPosition]);

  useEffect(() => {
    if (!enabled) {
      fetchedRef.current = false;
      setStatus("idle");
      return;
    }

    if (initialCoords) {
      setCoordinates(initialCoords);
      setGpsLocked(true);
      setStatus("ready");
      enrichLocationLabel(initialCoords, initialLocation).then(setLocationLabel);
      return;
    }

    if (autoFetch && !fetchedRef.current) {
      fetchedRef.current = true;
      refresh();
    }
  }, [enabled, autoFetch, initialCoords, initialLocation, refresh]);

  return {
    coordinates,
    locationLabel,
    setLocationLabel,
    setCoordinates,
    status,
    accuracy,
    error,
    gpsLocked,
    refresh,
    isSupported: isGeolocationAvailable(),
  };
}
