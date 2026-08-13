import React from "react";
import { useNavigate } from "react-router-dom";
import { Mic, History, Hospital, MapPin, User, ChevronRight, WifiOff, CloudOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { GlassCard } from "../../components/common/GlassCard";

const LINKS = [
  { to: "/user/voice", label: "Voice Emergency", desc: "Speak your emergency", icon: Mic, color: "text-emergency-red" },
  { to: "/user/status", label: "Emergency Status", desc: "Live pipeline progress", icon: MapPin, color: "text-accent-cyan" },
  { to: "/user/history", label: "Emergency History", desc: "Past reports & resolutions", icon: History, color: "text-purple-400" },
  { to: "/user/hospitals", label: "Nearby Hospitals", desc: "Recommended destinations", icon: Hospital, color: "text-accent-blue" },
  { to: "/user/nearby", label: "Emergency Services", desc: "Police, fire, rescue hubs", icon: MapPin, color: "text-emergency-amber" },
  { to: "/user/profile", label: "Profile", desc: "Account & preferences", icon: User, color: "text-slate-300" },
];

export function UserMoreScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { online, pendingCount } = useOfflineSync();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-2">
      <h1 className="mb-1 text-2xl font-bold text-white">More</h1>
      <p className="mb-4 text-sm text-slate-400">RESQ-X user services</p>

      {!online && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emergency-amber/30 bg-emergency-amber/10 px-3 py-2 text-xs text-emergency-amber">
          <WifiOff className="h-4 w-4 shrink-0" />
          Offline mode — SOS reports are stored locally and sync when online.
        </div>
      )}
      {pendingCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-2 text-xs text-accent-cyan">
          <CloudOff className="h-4 w-4 shrink-0" />
          {pendingCount} emergency report(s) waiting to sync.
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold text-white">{user?.name}</p>
        <p className="text-xs text-slate-500">{user?.email}</p>
        <span className="mt-2 inline-block rounded-full bg-emergency-emerald/15 px-2 py-0.5 text-[10px] font-medium uppercase text-emergency-emerald">
          User
        </span>
      </div>

      <div className="space-y-2">
        {LINKS.map(({ to, label, desc, icon: Icon, color }) => (
          <button key={to} onClick={() => navigate(to)} className="w-full text-left">
            <GlassCard className="flex items-center gap-3 p-4 transition hover:border-accent-cyan/30">
              <Icon className={`h-6 w-6 shrink-0 ${color}`} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{label}</p>
                <p className="text-[11px] text-slate-500">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </GlassCard>
          </button>
        ))}
      </div>

      <button onClick={logout} className="mt-6 w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
        Logout
      </button>
    </div>
  );
}
