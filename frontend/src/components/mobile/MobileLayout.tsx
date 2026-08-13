import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MapPin, Bell, MoreHorizontal } from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "../common/ThemeToggle";

const NAV = [
  { to: "/user", label: "Home", icon: Home, end: true },
  { to: "/user/track", label: "Track", icon: MapPin },
  { to: "/user/alerts", label: "Alerts", icon: Bell },
  { to: "/user/more", label: "More", icon: MoreHorizontal },
];

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.12),transparent)] p-4">
      <div className="phone-frame relative flex h-[780px] w-full max-w-[390px] flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-navy-light">
        <div className="flex shrink-0 items-center justify-between px-6 pt-3 text-[11px] text-slate-400">
          <span>9:41</span><div className="mx-auto h-6 w-28 rounded-full bg-black/40" />
          <ThemeToggle className="!px-1.5 !py-1 scale-90" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        {location.pathname !== "/user/more" && (
          <nav className="shrink-0 border-t border-white/5 bg-navy/80 px-2 pb-6 pt-2 backdrop-blur-md">
            <div className="flex justify-around">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => clsx(
                  "flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-[10px] transition",
                  isActive ? "text-accent-cyan" : "text-slate-500 hover:text-slate-300"
                )}><Icon className="h-5 w-5" />{label}</NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
