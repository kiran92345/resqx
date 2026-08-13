import React from "react";
import { Phone, Shield, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { GlassCard } from "../../components/common/GlassCard";
import { INDIA_EMERGENCY_LOCATIONS } from "../../data/indiaLocations";
import { UserPageHeader } from "../../components/user/UserPageHeader";

export function NearbyServicesScreen() {
  const hubs = INDIA_EMERGENCY_LOCATIONS.filter((l) => l.type !== "hospital").slice(0, 6);

  return (
    <div>
      <UserPageHeader title="Emergency Services" subtitle="Police, fire, rescue & response hubs near you" />

      <a href="tel:112" className="mb-4 block rounded-2xl border border-emergency-red/40 bg-emergency-red/15 p-4 text-center">
        <Phone className="mx-auto mb-1 h-6 w-6 text-emergency-red" />
        <p className="text-2xl font-black text-emergency-red">112</p>
        <p className="text-[10px] text-red-200">National Emergency — 24/7</p>
      </a>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hubs.map((h) => (
          <GlassCard key={h.id} className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/15">
              <Shield className="h-5 w-5 text-accent-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{h.name}</p>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3" />{h.city} · {h.type}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Profile</h1>

      <div className="mb-6 flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/15 text-2xl font-bold text-accent-cyan">
          {user?.name?.charAt(0) ?? "U"}
        </div>
        <p className="text-lg font-semibold text-white">{user?.name}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
        <span className="mt-2 rounded-full bg-emergency-emerald/15 px-3 py-0.5 text-[10px] font-semibold uppercase text-emergency-emerald">
          User Account
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {[
          ["Role", "User / Reporter"],
          ["Location sharing", "Enabled during SOS"],
          ["Offline SOS", "Store-and-forward enabled"],
          ["Languages", "English, Hindi, Telugu (voice demo)"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between rounded-lg border border-white/5 px-3 py-2.5">
            <span className="text-slate-500">{k}</span>
            <span className="text-white">{v}</span>
          </div>
        ))}
      </div>

      <button onClick={logout} className="mt-8 w-full rounded-xl border border-white/10 py-3 text-sm text-slate-400 hover:bg-white/5">
        Logout
      </button>
    </div>
  );
}
