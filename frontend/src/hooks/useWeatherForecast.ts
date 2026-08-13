import { useCallback, useEffect, useState } from "react";
import { INDIA_WEATHER_CITIES } from "../data/indiaWeatherCities";

export interface CityWeather {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number];
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  feelsLike: number;
  hourly: { time: string; temp: number; code: number }[];
  daily: { date: string; max: number; min: number; code: number }[];
}

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

async function fetchCityWeather(city: typeof INDIA_WEATHER_CITIES[0]): Promise<CityWeather> {
  const [lat, lng] = city.coordinates;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "Asia/Kolkata",
    forecast_days: "7",
  });
  const res = await fetch(`${OPEN_METEO}?${params}`);
  if (!res.ok) throw new Error("Weather API failed");
  const data = await res.json();
  const now = new Date();
  const hourIdx = data.hourly.time.findIndex((t: string) => new Date(t) >= now);

  return {
    id: city.id,
    name: city.name,
    state: city.state,
    coordinates: city.coordinates,
    temperature: Math.round(data.current.temperature_2m),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: data.current.weather_code,
    feelsLike: Math.round(data.current.apparent_temperature),
    hourly: data.hourly.time.slice(hourIdx, hourIdx + 24).map((t: string, i: number) => ({
      time: t,
      temp: Math.round(data.hourly.temperature_2m[hourIdx + i]),
      code: data.hourly.weather_code[hourIdx + i],
    })),
    daily: data.daily.time.map((d: string, i: number) => ({
      date: d,
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      code: data.daily.weather_code[i],
    })),
  };
}

function mockWeather(city: typeof INDIA_WEATHER_CITIES[0], seed: number): CityWeather {
  const base = 22 + seed * 3 + (city.coordinates[0] - 15) * 0.4;
  const temp = Math.round(base);
  const hourly = Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() + i * 3600000).toISOString(),
    temp: Math.round(temp + Math.sin(i / 4) * 4),
    code: i > 18 ? 3 : 1,
  }));
  const daily = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
    max: temp + 3 + i,
    min: temp - 4,
    code: 2,
  }));
  return {
    id: city.id,
    name: city.name,
    state: city.state,
    coordinates: city.coordinates,
    temperature: temp,
    humidity: 55 + seed * 5,
    windSpeed: 8 + seed * 2,
    weatherCode: 2,
    feelsLike: temp + 2,
    hourly,
    daily,
  };
}

export function useWeatherForecast() {
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(INDIA_WEATHER_CITIES.map(fetchCityWeather));
      setCities(results);
      setLive(true);
      setError(null);
    } catch {
      setCities(INDIA_WEATHER_CITIES.map((c, i) => mockWeather(c, i)));
      setLive(false);
      setError("Using simulated data — live API unavailable");
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 600000);
    return () => clearInterval(interval);
  }, [load]);

  return { cities, loading, live, lastUpdated, error, refresh: load };
}
