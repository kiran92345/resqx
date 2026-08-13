export type GeoCoordinates = [number, number];

export interface LiveLocationResult {
  coordinates: GeoCoordinates;
  label: string;
  accuracy: number | null;
  source: "gps" | "fallback";
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export function isGeolocationAvailable(): boolean {
  return typeof window !== "undefined" && window.isSecureContext && "geolocation" in navigator;
}

export function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location permission denied. Allow location access for this site in your browser.";
    case 2:
      return "Location unavailable. Turn on device GPS or Wi‑Fi and try again.";
    case 3:
      return "Location request timed out. Tap “Use live GPS” to retry.";
    default:
      return "Could not detect your live location.";
  }
}

export function fetchCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error("Live GPS requires HTTPS (or localhost) and a supported browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, GEO_OPTIONS);
  });
}

export function formatCoordinates(coords: GeoCoordinates): string {
  return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
}

export function looksLikeCoordinates(text: string): boolean {
  return /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(text.trim());
}

/** Reverse geocode via OpenStreetMap Nominatim (no API key). */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("zoom", "16");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string | undefined>;
    };

    const address = data.address;
    if (address) {
      const parts = [
        address.neighbourhood || address.suburb || address.residential || address.quarter,
        address.city || address.town || address.village || address.municipality || address.county,
        address.state,
      ].filter(Boolean);
      if (parts.length) return parts.join(", ");
    }

    return data.display_name?.split(",").slice(0, 3).join(",").trim() ?? null;
  } catch {
    return null;
  }
}

export async function resolveLiveLocation(
  fallback?: GeoCoordinates,
  fallbackLabel?: string
): Promise<LiveLocationResult> {
  try {
    const position = await fetchCurrentPosition();
    const coordinates: GeoCoordinates = [
      position.coords.latitude,
      position.coords.longitude,
    ];
    const label =
      (await reverseGeocode(coordinates[0], coordinates[1])) ??
      formatCoordinates(coordinates);

    return {
      coordinates,
      label,
      accuracy: position.coords.accuracy ?? null,
      source: "gps",
    };
  } catch (error) {
    if (fallback) {
      return {
        coordinates: fallback,
        label: fallbackLabel ?? formatCoordinates(fallback),
        accuracy: null,
        source: "fallback",
      };
    }

    const geoError = error as GeolocationPositionError;
    if (geoError?.code != null) throw new Error(getGeolocationErrorMessage(geoError.code));
    throw error;
  }
}

export async function enrichLocationLabel(
  coordinates: GeoCoordinates,
  currentLabel?: string
): Promise<string> {
  if (currentLabel && !looksLikeCoordinates(currentLabel)) return currentLabel;
  const geocoded = await reverseGeocode(coordinates[0], coordinates[1]);
  return geocoded ?? currentLabel ?? formatCoordinates(coordinates);
}
