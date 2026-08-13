import { interpolateTemp, thermalGradient } from "./thermalColors";

const INDIA_BOUNDS = { latMin: 8, latMax: 35, lngMin: 68, lngMax: 97 };

export function tempToColorRgb(temp: number): { r: number; g: number; b: number } {
  const str = thermalGradient(temp);
  const match = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return { r: 59, g: 130, b: 246 };
  return { r: +match[1], g: +match[2], b: +match[3] };
}

/** Smooth IDW heatmap rendered to canvas — meteorological-style overlay */
export function buildThermalHeatmapUrl(
  readings: { lat: number; lng: number; temp: number }[],
  width = 320,
  height = 240
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx || readings.length === 0) return "";

  const image = ctx.createImageData(width, height);
  const { latMin, latMax, lngMin, lngMax } = INDIA_BOUNDS;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lat = latMax - (y / (height - 1)) * (latMax - latMin);
      const lng = lngMin + (x / (width - 1)) * (lngMax - lngMin);
      const temp = interpolateTemp(lat, lng, readings);
      const { r, g, b } = tempToColorRgb(temp);
      const idx = (y * width + x) * 4;
      image.data[idx] = r;
      image.data[idx + 1] = g;
      image.data[idx + 2] = b;
      image.data[idx + 3] = 210;
    }
  }

  ctx.putImageData(image, 0, 0);

  const blurred = document.createElement("canvas");
  blurred.width = width;
  blurred.height = height;
  const bctx = blurred.getContext("2d");
  if (!bctx) return canvas.toDataURL("image/png");

  bctx.filter = "blur(10px)";
  bctx.drawImage(canvas, 0, 0);
  bctx.globalCompositeOperation = "destination-in";
  bctx.filter = "none";
  bctx.fillStyle = "rgba(0,0,0,0.72)";
  bctx.fillRect(0, 0, width, height);

  return blurred.toDataURL("image/png");
}

export const THERMAL_MAP_BOUNDS: [[number, number], [number, number]] = [
  [INDIA_BOUNDS.latMin, INDIA_BOUNDS.lngMin],
  [INDIA_BOUNDS.latMax, INDIA_BOUNDS.lngMax],
];
