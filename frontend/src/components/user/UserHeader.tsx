import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User, WifiOff, Settings, ArrowLeft, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";
import { ResQXBrandLogo } from "../common/ResQXBrandLogo";
import { USER_PAGE_TITLES } from "./UserPageHeader";

export function UserHeader({
  connected,
  onMenuClick,
  menuOpen,
}: {
  connected?: boolean;
  onMenuClick?: () => void;
  menuOpen?: boolean;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === "/user" || location.pathname === "/user/";
  const pageTitle = USER_PAGE_TITLES[location.pathname];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="dashboard-header border-b border-[var(--border-subtle)] px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="dashboard-header__control flex h-10 w-10 shrink-0 items-center justify-center rounded-lg lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          {!isHome && (
            <button
              type="button"
              onClick={() => navigate("/user")}
              aria-label="Back to Home"
              className="dashboard-header__control flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition hover:text-accent-cyan lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only sm:inline">Back</span>
            </button>
          )}
          {isHome ? (
            <>
              <ResQXBrandLogo size="header" variant="wordmark" className="min-w-0 shrink" />
              <span className="hidden items-center gap-1.5 rounded-full border border-emergency-emerald/35 bg-emergency-emerald/12 px-2.5 py-0.5 text-xs font-medium text-emergency-emerald sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emergency-emerald" />
                SOS Ready
              </span>
            </>
          ) : (
            <div className="min-w-0 truncate">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{pageTitle ?? "User Portal"}</p>
              <button
                type="button"
                onClick={() => navigate("/user")}
                className="hidden items-center gap-1 text-xs text-accent-cyan hover:underline lg:inline-flex"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Home
              </button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {connected === false && (
            <span className="dashboard-header__status-warn inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium">
              <WifiOff className="h-3.5 w-3.5" />
              Reconnecting…
            </span>
          )}
          <ThemeToggle />
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="dashboard-header__control flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-cyan/15">
                <User className="h-4 w-4 text-accent-cyan" />
              </div>
              <span className="dashboard-header__control-text hidden sm:inline">{user?.name}</span>
              <ChevronDown className="h-4 w-4 text-[var(--text-faint)]" />
            </button>
            {profileOpen && (
              <div className="dashboard-header__dropdown absolute right-0 top-full z-50 mt-1 w-52 rounded-xl py-1">
                <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                  <p className="dashboard-header__title text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-[var(--text-faint)]">{user?.email}</p>
                </div>
                {!isHome && (
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); navigate("/user"); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); navigate("/user/settings"); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-emergency-red"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
