import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { VoiceEmergencyModal } from "../../components/mobile/VoiceEmergencyModal";
import { ReportEmergencyModal } from "../../components/mobile/ReportEmergencyModal";
import { useToast } from "../../components/common/Toast";
import { useTracking } from "../../context/TrackingContext";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { fromApiIncident } from "../../data/incidentTracking";
import { resolveUserIncident } from "../../services/userEmergencyStore";
import type { EmergencyCategoryId } from "../../data/mockDashboard";
import { UserPageHeader } from "../../components/user/UserPageHeader";

export function VoiceEmergencyPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { startTracking } = useTracking();
  const { online } = useOfflineSync();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [prefill, setPrefill] = useState<{
    category: EmergencyCategoryId;
    description: string;
    coordinates: [number, number];
    location: string;
  } | null>(null);

  async function handleSubmitted(id: string) {
    localStorage.setItem("resqx_last_incident", id);
    const inc = await resolveUserIncident(id);
    if (inc) {
      startTracking(fromApiIncident(inc));
      navigate("/user/track");
    } else {
      push("Emergency saved — check Status for updates", "info");
      navigate("/user/status");
    }
  }

  return (
    <>
      <UserPageHeader
        title="Voice Emergency"
        subtitle={online ? "Describe your emergency by voice — we transcribe and classify it automatically." : "Offline — voice report will be saved locally."}
      />
      <div className="mx-auto max-w-lg pb-8 text-center">
        <Mic className="mx-auto mb-4 h-12 w-12 text-accent-cyan" />
        <button
          type="button"
          onClick={() => setVoiceOpen(true)}
          className="rounded-xl border border-accent-cyan/40 bg-accent-cyan/10 px-6 py-3 text-sm font-semibold text-accent-cyan hover:bg-accent-cyan/15"
        >
          Open Voice Recorder
        </button>
      </div>

      <VoiceEmergencyModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onComplete={(data) => {
          setPrefill({
            category: data.category,
            description: data.transcript,
            coordinates: data.coordinates,
            location: data.location,
          });
          setVoiceOpen(false);
          setReportOpen(true);
        }}
      />

      <ReportEmergencyModal
        open={reportOpen}
        onClose={() => { setReportOpen(false); setPrefill(null); }}
        onSubmitted={handleSubmitted}
        initialCategory={prefill?.category}
        initialDescription={prefill?.description}
        initialLocation={prefill?.location}
        initialCoords={prefill?.coordinates}
        voiceTranscript={prefill?.description}
      />
    </>
  );
}
