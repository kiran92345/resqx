import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, AlertTriangle, Boxes, Brain, FileText, Bell, MessageSquare, Settings, Phone, CloudSun, Radio } from "lucide-react";
import clsx from "clsx";
import { ShieldLogo } from "../common/ShieldLogo";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/map", label: "Live Map", icon: Map },
  { to: "/admin/weather", label: "Weather Forecast", icon: CloudSun },
  { to: "/admin/zones", label: "Incidents", icon: AlertTriangle },
  { to: "/admin/resources", label: "Resources", icon: Boxes },
  { to: "/admin/dispatch", label: "Dispatch Center", icon: Radio },
  { to: "/admin/analytics", label: "AI Control Center", icon: Brain },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/alerts", label: "Alerts", icon: Bell },
  { to: "/admin/communication", label: "Communication", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border-subtle)] p-4">
        <ShieldLogo size="sm" subtitle="Admin Control Center" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => clsx(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition",
            isActive ? "bg-accent-blue/15 text-accent-blue shadow-sm" : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
          )}>
            <Icon className="h-4 w-4 shrink-0" />{label}
          </NavLink>
        ))}
      </nav>
      <a href="tel:112" className="m-3 block rounded-xl border border-emergency-red/40 bg-emergency-red/10 p-4 transition hover:bg-emergency-red/20">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-red/25"><Phone className="h-4 w-4 text-emergency-red" /></div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400">Emergency Call</p>
            <p className="text-[10px] text-slate-500">Available 24/7</p>
          </div>
        </div>
        <p className="text-2xl font-black text-emergency-red">112</p>
        <p className="text-[10px] text-slate-500">Toll Free</p>
      </a>
    </aside>
  );
}
