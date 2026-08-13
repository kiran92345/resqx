import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Hospital, AlertTriangle, Mic, WifiOff, Activity, History } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ReportEmergencyModal } from "../../components/mobile/ReportEmergencyModal";
import { VoiceEmergencyModal } from "../../components/mobile/VoiceEmergencyModal";
import { useToast } from "../../components/common/Toast";
import { useTracking } from "../../context/TrackingContext";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { fromApiIncident } from "../../data/incidentTracking";
import { resolveUserIncident } from "../../services/userEmergencyStore";
import type { EmergencyCategoryId } from "../../data/mockDashboard";

const QUICK_LINKS = [
  { label: "Live Tracking", icon: MapPin, color: "text-accent-cyan", bg: "bg-accent-cyan/10 border-accent-cyan/20", route: "/user/track" },
  { label: "My Alerts", icon: AlertTriangle, color: "text-emergency-amber", bg: "bg-emergency-amber/10 border-emergency-amber/20", route: "/user/alerts" },
  { label: "Status", icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", route: "/user/status" },
  { label: "History", icon: History, color: "text-slate-300", bg: "bg-slate-500/10 border-slate-500/20", route: "/user/history" },
  { label: "Hospitals", icon: Hospital, color: "text-accent-blue", bg: "bg-accent-blue/10 border-accent-blue/20", route: "/user/hospitals" },
  { label: "Services", icon: MapPin, color: "text-emergency-emerald", bg: "bg-emergency-emerald/10 border-emergency-emerald/20", route: "/user/nearby" },
];

export function MobileHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const { startTracking } = useTracking();
  const { online, pendingCount } = useOfflineSync((id) => {
    localStorage.setItem("resqx_last_incident", id);
    push("Offline emergency synced to RESQ-X", "info");
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voicePrefill, setVoicePrefill] = useState<{
    category: EmergencyCategoryId;
    transcript: string;
    coordinates: [number, number];
    location: string;
  } | null>(null);

  async function afterSubmit(id: string) {
    localStorage.setItem("resqx_last_incident", id);

    const inc = await resolveUserIncident(id);
    if (inc) {
      startTracking(fromApiIncident(inc));
      navigate("/user/track");
      return;
    }

    if (id.startsWith("offline-")) {
      push("Emergency saved — open Status to follow progress", "info");
      navigate("/user/status");
      return;
    }

    navigate("/user/track");
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Hello, {user?.name?.split(" ")[0] ?? "User"}
        </h1>
        <p className="mt-1 text-[var(--text-muted)]">Report emergencies, track response, and access nearby services.</p>
      </div>

      {(!online || pendingCount > 0) && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emergency-amber/30 bg-emergency-amber/10 px-4 py-3 text-sm text-emergency-amber">
          <WifiOff className="h-4 w-4 shrink-0" />
          {!online ? "Offline — SOS uses store-and-forward until network returns." : `${pendingCount} report(s) pending sync.`}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass-card flex flex-col items-center justify-center p-8 text-center">
          <p className="mb-6 text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">Immediate Assistance</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="glow-red flex h-48 w-48 flex-col items-center justify-center rounded-full bg-emergency-red transition hover:scale-[1.02] active:scale-95"
          >
            <span className="text-5xl font-black text-white">SOS</span>
            <span className="mt-2 px-4 text-sm text-red-100">Emergency — Click to Report</span>
          </button>
          <button
            type="button"
            onClick={() => setVoiceOpen(true)}
            className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 py-3 text-sm font-semibold text-accent-cyan transition hover:bg-accent-cyan/15"
          >
            <Mic className="h-5 w-5" />
            Voice Emergency
          </button>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUICK_LINKS.map(({ label, icon: Icon, color, bg, route }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(route)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition hover:bg-white/[0.06] ${bg}`}
              >
                <Icon className={`h-7 w-7 ${color}`} />
                <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ReportEmergencyModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setVoicePrefill(null); }}
        onSubmitted={afterSubmit}
        initialCategory={voicePrefill?.category}
        initialDescription={voicePrefill?.transcript}
        initialLocation={voicePrefill?.location}
        initialCoords={voicePrefill?.coordinates}
        voiceTranscript={voicePrefill?.transcript}
      />

      <VoiceEmergencyModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onComplete={(data) => {
          setVoiceOpen(false);
          setVoicePrefill(data);
          setModalOpen(true);
        }}
      />
    </>
  );
}
