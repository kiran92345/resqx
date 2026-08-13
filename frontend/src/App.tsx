import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider, useToast } from "./components/common/Toast";
import { useWebSocket } from "./hooks/useWebSocket";
import { AuthScreen } from "./pages/AuthScreen";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { IncidentTable } from "./pages/admin/IncidentTable";
import { ResourceHub } from "./pages/admin/ResourceHub";
import { DispatchCenter } from "./pages/admin/DispatchCenter";
import { WeatherForecastPage } from "./pages/admin/WeatherForecastPage";
import { PlaceholderPage } from "./pages/admin/PlaceholderPage";
import { AIAnalyticsPage } from "./pages/admin/AIAnalyticsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { DashboardHeader } from "./components/admin/DashboardHeader";
import { UserLayout } from "./components/user/UserLayout";
import { MobileHome } from "./pages/user/MobileHome";
import { LiveTrackingScreen } from "./pages/user/LiveTrackingScreen";
import { AlertsScreen } from "./pages/user/AlertsScreen";
import { EmergencyStatusScreen } from "./pages/user/EmergencyStatusScreen";
import { EmergencyHistoryScreen } from "./pages/user/EmergencyHistoryScreen";
import { HospitalsScreen } from "./pages/user/HospitalsScreen";
import { NearbyServicesScreen } from "./pages/user/NearbyServicesScreen";
import { VoiceEmergencyPage } from "./pages/user/VoiceEmergencyPage";
import { UserWeatherPage } from "./pages/user/UserWeatherPage";
import { UserSettingsPage } from "./pages/user/UserSettingsPage";
import { DashboardMap } from "./components/map/DashboardMap";
import { TrackingProvider } from "./context/TrackingContext";
import { IncidentTrackingPanel } from "./components/incident/IncidentTrackingPanel";
import { fromApiIncident, type TrackableIncident } from "./data/incidentTracking";
import * as apiClient from "./api/client";
import { ThemeProvider } from "./context/ThemeContext";
import type { Incident, UserRole } from "./types";

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
    <div className="relative h-[calc(100vh-80px)] p-4">
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
      <div className="flex min-h-screen bg-[var(--app-bg)]">
        <LiveEventBridge lastEvent={lastEvent} role="admin" />
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader connected={connected} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

function UserLayoutShell() {
  const { connected, lastEvent } = useWebSocket();
  return (
    <RoleGuard role="user">
      <LiveEventBridge lastEvent={lastEvent} role="user" />
      <UserLayout connected={connected}>
        <Outlet />
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
