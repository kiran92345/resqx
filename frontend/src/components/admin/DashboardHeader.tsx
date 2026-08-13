import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Calendar, User, LogOut, ShieldCheck, CheckCheck, WifiOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { MOCK_NOTIFICATIONS } from "../../data/mockDashboard";
import clsx from "clsx";
import { ThemeToggle } from "../common/ThemeToggle";
import { ResQXBrandLogo } from "../common/ResQXBrandLogo";

export function DashboardHeader({ connected }: { connected?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formatted = time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " | " + time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  function markAllRead() {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  return (
    <header className="dashboard-header px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <ResQXBrandLogo size="header" variant="wordmark" />
            <span className="flex items-center gap-1.5 rounded-full border border-emergency-emerald/35 bg-emergency-emerald/12 px-2.5 py-0.5 text-xs font-medium text-emergency-emerald">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emergency-emerald" />
              System Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-blue sm:inline">
            Administrator
          </span>

          <ThemeToggle />

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="dashboard-header__control relative rounded-lg p-2 transition"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emergency-red text-[9px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="dashboard-header__dropdown absolute right-0 top-full z-50 mt-2 w-80 rounded-xl">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
                  <span className="dashboard-header__title text-sm font-semibold">Notifications</span>
                  <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-accent-cyan hover:underline">
                    <CheckCheck className="h-3 w-3" />Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setNotifications((cur) => cur.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                      className={clsx(
                        "w-full border-b border-[var(--border-subtle)] px-4 py-3 text-left transition hover:bg-[var(--surface-muted)]",
                        !n.read && "bg-accent-blue/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="dashboard-header__title text-sm font-medium">{n.title}</p>
                        {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-cyan" />}
                      </div>
                      <p className="dashboard-header__subtitle mt-0.5 text-xs">{n.body}</p>
                      <p className="mt-1 text-[10px] text-[var(--text-faint)]">{n.time}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-header__control hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs md:flex">
            <Calendar className="h-3.5 w-3.5 text-[var(--text-faint)]" />
            <span className="dashboard-header__control-text">{formatted}</span>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="dashboard-header__control flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-blue/15">
                <User className="h-4 w-4 text-accent-blue" />
              </div>
              <span className="dashboard-header__control-text hidden sm:inline">Admin Control Center</span>
              <ChevronDown className="h-4 w-4 text-[var(--text-faint)]" />
            </button>
            {profileOpen && (
              <div className="dashboard-header__dropdown absolute right-0 top-full z-50 mt-1 w-52 rounded-xl py-1">
                <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                  <p className="dashboard-header__title text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-[var(--text-faint)]">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                >
                  <ShieldCheck className="h-4 w-4" />Settings
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-emergency-red"
                >
                  <LogOut className="h-4 w-4" />Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {connected === false && (
        <p className="dashboard-header__status-warn mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium">
          <WifiOff className="h-3.5 w-3.5" />
          Reconnecting to live feed…
        </p>
      )}
    </header>
  );
}
