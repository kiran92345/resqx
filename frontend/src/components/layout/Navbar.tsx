import React from "react";
import { Siren, ShieldCheck, User, Wifi, WifiOff, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Navbar({ connected }: { connected: boolean }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Siren className="h-6 w-6 text-emergency-red" />
        <span className="text-lg font-bold tracking-tight">
          ResQ<span className="text-emergency-red">-X</span>
        </span>
        <span className="ml-2 hidden text-xs text-slate-500 sm:inline">
          Right Resource, Right Place, Right Time.
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs capitalize text-slate-300 sm:flex">
            {user.role === "admin" ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            {user.role}
          </span>
        )}

        <div
          className="flex items-center gap-1 text-xs text-slate-400"
          title={connected ? "Live updates connected" : "Reconnecting..."}
        >
          {connected ? (
            <Wifi className="h-4 w-4 text-emergency-emerald" />
          ) : (
            <WifiOff className="h-4 w-4 text-amber-500" />
          )}
        </div>

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-md border border-slate-800 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-100"
          >
            <LogOut className="h-3.5 w-3.5" /> {user.name}
          </button>
        )}
      </div>
    </header>
  );
}
