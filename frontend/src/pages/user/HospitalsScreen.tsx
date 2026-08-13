import React from "react";
import { Navigation, MapPin } from "lucide-react";
import { GlassCard } from "../../components/common/GlassCard";
import { INDIA_EMERGENCY_LOCATIONS } from "../../data/indiaLocations";
import { useToast } from "../../components/common/Toast";
import { UserPageHeader } from "../../components/user/UserPageHeader";

export function HospitalsScreen() {
  const { push } = useToast();
  const hospitals = INDIA_EMERGENCY_LOCATIONS.filter((l) => l.type === "hospital").slice(0, 8);

  return (
    <div>
      <UserPageHeader
        title="Nearby Hospitals"
        subtitle="Recommendations based on distance. Live bed capacity shown only when verified data is available."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((h, i) => (
          <GlassCard key={h.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{h.name}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />{h.city}, {h.state}
                </p>
              </div>
              {i === 0 && (
                <span className="shrink-0 rounded-full bg-accent-cyan/15 px-2 py-0.5 text-[9px] font-semibold uppercase text-accent-cyan">
                  Recommended
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                <span className="text-white">~{(2.5 + i * 1.2).toFixed(1)} km</span>
                {" · ETA "}
                <span className="text-white">{8 + i * 3} min</span>
              </div>
              <button
                onClick={() => push(`Navigation to ${h.name} (demo)`, "info")}
                className="flex items-center gap-1 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-1 text-[10px] font-medium text-accent-cyan"
              >
                <Navigation className="h-3 w-3" /> Navigate
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
