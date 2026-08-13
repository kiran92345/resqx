import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListTree,
  Boxes,
  Truck,
  FileEdit,
  ClipboardList,
  Radar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/zones", label: "Affected Zones", icon: ListTree },
  { to: "/admin/resources", label: "Resource Hub", icon: Boxes },
  { to: "/admin/dispatch", label: "Dispatch Center", icon: Truck },
];

const USER_LINKS = [
  { to: "/user", label: "Request Help", icon: FileEdit, end: true },
  { to: "/user/track", label: "Track Request", icon: ClipboardList },
  { to: "/user/stock", label: "Stock Radar", icon: Radar },
];

export function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? ADMIN_LINKS : USER_LINKS;

  return (
    <nav className="w-48 shrink-0 border-r border-slate-800 p-3">
      <div className="space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-emergency-red/15 text-emergency-red"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
