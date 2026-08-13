export interface IndiaWeatherCity {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number];
}

export const INDIA_WEATHER_CITIES: IndiaWeatherCity[] = [
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", coordinates: [17.385, 78.4867] },
  { id: "delhi", name: "New Delhi", state: "Delhi", coordinates: [28.7041, 77.1025] },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", coordinates: [19.076, 72.8777] },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", coordinates: [13.0827, 80.2707] },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", coordinates: [22.5726, 88.3639] },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", coordinates: [12.9716, 77.5946] },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", coordinates: [23.0225, 72.5714] },
  { id: "kochi", name: "Kochi", state: "Kerala", coordinates: [9.9312, 76.2673] },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", coordinates: [26.9124, 75.7873] },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", coordinates: [26.8467, 80.9462] },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", coordinates: [23.2599, 77.4126] },
  { id: "patna", name: "Patna", state: "Bihar", coordinates: [25.5941, 85.1376] },
];

export const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Depositing rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌧️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Moderate rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "⛈️" },
  80: { label: "Rain showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

export function weatherLabel(code: number) {
  return WEATHER_CODES[code]?.label ?? "Unknown";
}

export function weatherIcon(code: number) {
  return WEATHER_CODES[code]?.icon ?? "🌡️";
}
