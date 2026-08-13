import { TileLayer } from "react-leaflet";
import { useTheme } from "../../context/ThemeContext";

const DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export function ThemedTileLayer() {
  const { theme } = useTheme();
  return <TileLayer key={theme} url={theme === "light" ? LIGHT : DARK} />;
}
