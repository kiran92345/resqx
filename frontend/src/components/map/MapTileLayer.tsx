import { TileLayer } from "react-leaflet";

/** Esri World Imagery — satellite view */
export const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

/** Labels overlay for satellite */
export const SATELLITE_LABELS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export function SatelliteTileLayer({ labels = true }: { labels?: boolean }) {
  return (
    <>
      <TileLayer url={SATELLITE_TILES} attribution="&copy; Esri" maxZoom={19} />
      {labels && (
        <TileLayer url={SATELLITE_LABELS} attribution="" maxZoom={19} opacity={0.65} />
      )}
    </>
  );
}

export function MapTileLayer({
  variant = "satellite",
  theme = "dark",
}: {
  variant?: "satellite" | "street";
  theme?: "dark" | "light";
}) {
  if (variant === "satellite") return <SatelliteTileLayer />;
  return <TileLayer key={theme} url={theme === "light" ? LIGHT : DARK} />;
}
