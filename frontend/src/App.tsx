import React, { Suspense, useEffect, useState, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider, useToast } from "./components/common/Toast";
import { useWebSocket } from "./hooks/useWebSocket";
import { AuthScreen } from "./pages/AuthScreen";
import { AdminLayout } from "./components/admin/AdminLayout";
import { UserLayout } from "./components/user/UserLayout";
import { DashboardMap } from "./components/map/DashboardMap";
import { TrackingProvider } from "./context/TrackingContext";
import { IncidentTrackingPanel } from "./components/incident/IncidentTrackingPanel";
import { fromApiIncident, type TrackableIncident } from "./data/incidentTracking";
import * as apiClient from "./api/client";
import { ThemeProvider } from "./context/ThemeContext";
import type { Incident, UserRole } from "./types";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const IncidentTable = lazy(() => import("./pages/admin/IncidentTable").then((m) => ({ default: m.IncidentTable })));
const ResourceHub = lazy(() => import("./pages/admin/ResourceHub").then((m) => ({ default: m.ResourceHub })));
const DispatchCenter = lazy(() => import("./pages/admin/DispatchCenter").then((m) => ({ default: m.DispatchCenter })));
const WeatherForecastPage = lazy(() => import("./pages/admin/WeatherForecastPage").then((m) => ({ default: m.WeatherForecastPage })));
const PlaceholderPage = lazy(() => import("./pages/admin/PlaceholderPage").then((m) => ({ default: m.PlaceholderPage })));
const AIAnalyticsPage = lazy(() => import("./pages/admin/AIAnalyticsPage").then((m) => ({ default: m.AIAnalyticsPage })));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage })));
const MobileHome = lazy(() => import("./pages/user/MobileHome").then((m) => ({ default: m.MobileHome })));
const LiveTrackingScreen = lazy(() => import("./pages/user/LiveTrackingScreen").then((m) => ({ default: m.LiveTrackingScreen })));
const AlertsScreen = lazy(() => import("./pages/user/AlertsScreen").then((m) => ({ default: m.AlertsScreen })));
const EmergencyStatusScreen = lazy(() => import("./pages/user/EmergencyStatusScreen").then((m) => ({ default: m.EmergencyStatusScreen })));
const EmergencyHistoryScreen = lazy(() => import("./pages/user/EmergencyHistoryScreen").then((m) => ({ default: m.EmergencyHistoryScreen })));
const HospitalsScreen = lazy(() => import("./pages/user/HospitalsScreen").then((m) => ({ default: m.HospitalsScreen })));
const NearbyServicesScreen = lazy(() => import("./pages/user/NearbyServicesScreen").then((m) => ({ default: m.NearbyServicesScreen })));
const VoiceEmergencyPage = lazy(() => import("./pages/user/VoiceEmergencyPage").then((m) => ({ default: m.VoiceEmergencyPage })));
const UserWeatherPage = lazy(() => import("./pages/user/UserWeatherPage").then((m) => ({ default: m.UserWeatherPage })));
const UserSettingsPage = lazy(() => import("./pages/user/UserSettingsPage").then((m) => ({ default: m.UserSettingsPage })));

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
    </div>
  );
}

function LiveEventBridge({
  lastEvent,
  role,
}: {
  lastEvent: ReturnType<typeof useWebSocket>["lastEvent"];
  role: UserRole;
}) {
  const { push } = useToast();
  useEffect(() => {
    if (!lastEvent) return;
    if (role === "user") {
      if (lastEvent.type === "incident_created" || lastEvent.type === "status_updated") {
        const name = lastEvent.payload.name ?? lastEvent.payload.status;
        push(`Your emergency update: ${String(name).replace("_", " ")}`, "info");
      }
      return;
    }
    const msgs: Record<string, () => void> = {
      stock_alert: () => push(lastEvent.payload.message, "warning"),
      incident_created: () => push(`New: ${lastEvent.payload.name}`, "info"),
      status_updated: () => push(`Status: ${lastEvent.payload.status.replace("_", " ")}`, "info"),
      allocation_updated: () => push("Resources refreshed", "info"),
    };
    msgs[lastEvent.type]?.();
  }, [lastEvent, push, role]);
  return null;
}

function AdminLiveMapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tracking, setTracking] = useState<TrackableIncident | null>(null);
  useEffect(() => { apiClient.fetchIncidents().then(setIncidents).catch(() => {}); }, []);
  return (
    <div className="relative h-[calc(100dvh-4rem)] min-h-[320px] p-3 sm:h-[calc(100vh-80px)] sm:p-4">
      <DashboardMap incidents={incidents} fullScreen onTrack={setTracking} onSelect={(i) => setTracking(fromApiIncident(i))} />
      {tracking && <IncidentTrackingPanel incident={tracking} onClose={() => setTracking(null)} />}
    </div>
  );
}

function RoleGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }
  return <>{children}</>;
}

function AdminLayoutShell() {
  const { connected, lastEvent } = useWebSocket();
  return (
    <RoleGuard role="admin">
      <LiveEventBridge lastEvent={lastEvent} role="admin" />
      <AdminLayout connected={connected}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </AdminLayout>
    </RoleGuard>
  );
}

function UserLayoutShell() {
  const { connected, lastEvent } = useWebSocket();
  return (
    <RoleGuard role="user">
      <LiveEventBridge lastEvent={lastEvent} role="user" />
      <UserLayout connected={connected}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </UserLayout>
    </RoleGuard>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthScreen />} />
      </Routes>
    );
  }

  if (user.role === "admin") {
    return (
      <Routes>
        <Route element={<AdminLayoutShell />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/map" element={<AdminLiveMapPage />} />
          <Route path="/admin/weather" element={<WeatherForecastPage />} />
          <Route path="/admin/zones" element={<IncidentTable />} />
          <Route path="/admin/resources" element={<ResourceHub />} />
          <Route path="/admin/dispatch" element={<DispatchCenter />} />
          <Route path="/admin/analytics" element={<AIAnalyticsPage />} />
          <Route path="/admin/reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="/admin/alerts" element={<PlaceholderPage title="Alerts Management" />} />
          <Route path="/admin/communication" element={<PlaceholderPage title="Communication Center" />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="/user/*" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<UserLayoutShell />}>
        <Route path="/user" element={<MobileHome />} />
        <Route path="/user/track" element={<LiveTrackingScreen />} />
        <Route path="/user/alerts" element={<AlertsScreen />} />
        <Route path="/user/status" element={<EmergencyStatusScreen />} />
        <Route path="/user/history" element={<EmergencyHistoryScreen />} />
        <Route path="/user/hospitals" element={<HospitalsScreen />} />
        <Route path="/user/nearby" element={<NearbyServicesScreen />} />
        <Route path="/user/voice" element={<VoiceEmergencyPage />} />
        <Route path="/user/weather" element={<UserWeatherPage />} />
        <Route path="/user/settings" element={<UserSettingsPage />} />
        <Route path="/user/profile" element={<Navigate to="/user/settings" replace />} />
        <Route path="/user/more" element={<Navigate to="/user/settings" replace />} />
      </Route>
      <Route path="/admin/*" element={<Navigate to="/user" replace />} />
      <Route path="*" element={<Navigate to="/user" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TrackingProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </TrackingProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
