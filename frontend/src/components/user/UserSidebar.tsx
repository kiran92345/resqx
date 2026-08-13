import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home, MapPin, Bell, Mic, Activity, History, Hospital, Shield,
  CloudSun, Settings, Phone, X,
} from "lucide-react";
import clsx from "clsx";
import { ShieldLogo } from "../common/ShieldLogo";

const LINKS = [
  { to: "/user", label: "Home", icon: Home, end: true },
  { to: "/user/track", label: "My Tracking", icon: MapPin },
  { to: "/user/alerts", label: "My Alerts", icon: Bell },
  { to: "/user/status", label: "Emergency Status", icon: Activity },
  { to: "/user/voice", label: "Voice SOS", icon: Mic },
  { to: "/user/history", label: "My History", icon: History },
  { to: "/user/hospitals", label: "Hospitals", icon: Hospital },
  { to: "/user/nearby", label: "Emergency Services", icon: Shield },
  { to: "/user/weather", label: "Local Weather", icon: CloudSun },
  { to: "/user/settings", label: "Settings", icon: Settings },
];

export function UserSidebar({
  open = false,
  onNavigate,
}: {
  open?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className={clsx(
        "app-sidebar flex w-[min(18rem,88vw)] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)]",
        open && "app-sidebar--open"
      )}
      aria-hidden={!open ? undefined : undefined}
    >
      <div className="flex items-start justify-between border-b border-[var(--border-subtle)] p-4">
        <ShieldLogo size="sm" subtitle="User Portal" />
        <button
          type="button"
          onClick={onNavigate}
          className="app-sidebar__close rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => clsx(
              "flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition",
              isActive
                ? "bg-accent-cyan/15 text-accent-cyan shadow-sm"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <a
        href="tel:112"
        onClick={onNavigate}
        className="m-3 block rounded-xl border border-emergency-red/40 bg-emergency-red/10 p-4 transition hover:bg-emergency-red/20"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-red/25">
            <Phone className="h-4 w-4 text-emergency-red" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-[var(--text-faint)]">Emergency Call</p>
            <p className="text-[10px] text-[var(--text-muted)]">Available 24/7</p>
          </div>
        </div>
        <p className="text-2xl font-black text-emergency-red">112</p>
      </a>
    </aside>
  );
}
