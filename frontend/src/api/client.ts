import axios from "axios";
import type {
  Incident,
  ResourceInventory,
  AllocationPlan,
  KPIs,
  AuthUser,
} from "../types";
import type { XAIAnalytics } from "../types/xai";

import { storageGet } from "../utils/safeStorage";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = storageGet("resqx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Auth ----
export async function login(email: string, password: string) {
  const { data } = await api.post<{ access_token: string; user: AuthUser }>(
    "/auth/login",
    { email, password }
  );
  return data;
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: "admin" | "user"
) {
  const { data } = await api.post<{ access_token: string; user: AuthUser }>(
    "/auth/signup",
    { name, email, password, role }
  );
  return data;
}

// ---- Incidents ----
export async function fetchIncidents(params?: {
  status?: string;
  disaster_type?: string;
}) {
  const { data } = await api.get<Incident[]>("/incidents", { params });
  return data;
}

export async function fetchIncident(id: string) {
  const { data } = await api.get<Incident>(`/incidents/${id}`);
  return data;
}

export async function createIncident(payload: Record<string, unknown>) {
  const { data } = await api.post<Incident>("/incidents", payload);
  return data;
}

export async function updateIncidentStatus(id: string, status: string) {
  const { data } = await api.patch<Incident>(`/incidents/${id}/status`, {
    status,
  });
  return data;
}

// ---- Resources ----
export async function fetchResources() {
  const { data } = await api.get<ResourceInventory[]>("/resources");
  return data;
}

// ---- Allocations ----
export async function runOptimization() {
  const { data } = await api.post<AllocationPlan[]>("/allocations/optimize");
  return data;
}

export async function fetchAllocations() {
  const { data } = await api.get<AllocationPlan[]>("/allocations");
  return data;
}

// ---- Dashboard ----
export async function fetchKPIs() {
  const { data } = await api.get<KPIs>("/dashboard/kpis");
  return data;
}

export async function fetchPriorityTrend() {
  const { data } = await api.get("/dashboard/priority-trend");
  return data;
}

export async function fetchSupplyDemand() {
  const { data } = await api.get("/dashboard/resource-supply-demand");
  return data;
}

// ---- XAI Analytics ----
export async function fetchXAIAnalytics(params?: {
  disaster_type?: string;
  priority_level?: string;
}) {
  const { data } = await api.get<XAIAnalytics>("/analytics/xai", { params });
  return data;
}

export async function fetchIncidentExplanation(id: string) {
  const { data } = await api.get(`/analytics/xai/${id}`);
  return data;
}
