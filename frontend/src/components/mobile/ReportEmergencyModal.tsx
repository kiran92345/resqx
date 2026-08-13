import React, { useState, useEffect } from "react";
import { X, Heart, Flame, Car, Waves, ShieldAlert, MoreHorizontal, MapPin, Camera, Image, Mic, WifiOff } from "lucide-react";
import clsx from "clsx";
import { EMERGENCY_CATEGORIES, type EmergencyCategoryId } from "../../data/mockDashboard";
import { HYDERABAD_USER_LOCATION } from "../../data/indiaLocations";
import { useToast } from "../common/Toast";
import * as apiClient from "../../api/client";
import { isOnline, queueOfflineEmergency, toIncidentPayload } from "../../services/offlineEmergency";
import { registerFromApiIncident, registerFromOffline } from "../../services/userEmergencyStore";

const ICONS = { heart: Heart, flame: Flame, car: Car, waves: Waves, mask: ShieldAlert, dots: MoreHorizontal };
const TINTS: Record<string, string> = {
  red: "border-red-500/40 bg-red-500/10 text-red-400", orange: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  "dark-red": "border-red-700/40 bg-red-700/10 text-red-500", cyan: "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
  purple: "border-purple-500/40 bg-purple-500/10 text-purple-400", slate: "border-slate-500/40 bg-slate-500/10 text-slate-400",
};

export function ReportEmergencyModal({ open, onClose, onSubmitted, initialCategory, initialDescription, initialLocation, initialCoords, voiceTranscript }: {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (id: string) => void;
  initialCategory?: EmergencyCategoryId;
  initialDescription?: string;
  initialLocation?: string;
  initialCoords?: [number, number];
  voiceTranscript?: string;
}) {
  const { push } = useToast();
  const [category, setCategory] = useState<EmergencyCategoryId>(initialCategory ?? "medical");
  const [location, setLocation] = useState(initialLocation ?? "Banjara Hills, Hyderabad");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [media, setMedia] = useState<string[]>([]);
  const [coords, setCoords] = useState<[number, number]>(initialCoords ?? HYDERABAD_USER_LOCATION);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const online = isOnline();

  useEffect(() => {
    if (open) {
      if (initialCategory) setCategory(initialCategory);
      if (initialDescription) setDescription(initialDescription);
      if (initialLocation) setLocation(initialLocation);
      if (initialCoords) setCoords(initialCoords);
    }
  }, [open, initialCategory, initialDescription, initialLocation, initialCoords]);

  if (!open) return null;

  function useMyLocation() {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setCoords([pos.coords.latitude, pos.coords.longitude]); setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`); push("Location detected", "info"); setLocating(false); },
      () => { push("Using default location", "warning"); setLocating(false); }
    );
  }

  async function submit() {
    setSubmitting(true);
    const entry = { category, location, coordinates: coords, description, voiceTranscript, media };

    if (!online) {
      const queued = queueOfflineEmergency(entry);
      registerFromOffline(queued.localId, {
        category: entry.category,
        location: entry.location,
        coordinates: entry.coordinates,
        description: entry.description || entry.voiceTranscript || "Emergency report",
      });
      push("Emergency Saved — Network Unavailable. Will sync when online.", "warning");
      onSubmitted?.(queued.localId);
      onClose();
      setSubmitting(false);
      return;
    }

    try {
      const inc = await apiClient.createIncident(toIncidentPayload({ ...entry, localId: "", createdAt: "", synced: false }));
      registerFromApiIncident(inc, category);
      push("Emergency alert submitted!", "info");
      onSubmitted?.(inc.id);
      onClose();
    } catch {
      const queued = queueOfflineEmergency(entry);
      registerFromOffline(queued.localId, {
        category: entry.category,
        location: entry.location,
        coordinates: entry.coordinates,
        description: entry.description || entry.voiceTranscript || "Emergency report",
      });
      push("Saved locally — will sync when server is available", "warning");
      onSubmitted?.(queued.localId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="glass-card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl p-5 sm:max-w-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">REPORT AN EMERGENCY</h2>
            <p className="text-xs text-slate-400">Stay Calm, We are Here to Help!</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>

        {!online && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emergency-amber/30 bg-emergency-amber/10 px-3 py-2 text-[11px] text-emergency-amber">
            <WifiOff className="h-4 w-4 shrink-0" />
            Offline mode — report stored on device until network returns.
          </div>
        )}

        {voiceTranscript && (
          <div className="mb-4 rounded-lg border border-accent-cyan/20 bg-accent-cyan/5 px-3 py-2 text-xs text-accent-cyan">
            <Mic className="mb-1 inline h-3.5 w-3.5" /> Voice: {voiceTranscript}
          </div>
        )}

        <p className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Category</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {EMERGENCY_CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.icon as keyof typeof ICONS];
            return (
              <button key={cat.id} onClick={() => setCategory(cat.id)} className={clsx(
                "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition",
                category === cat.id ? `${TINTS[cat.tint]} ring-1 ring-white/20` : "border-white/5 bg-white/[0.03] text-slate-500"
              )}><Icon className="h-5 w-5" /><span className="text-[9px] font-medium">{cat.label}</span></button>
            );
          })}
        </div>

        <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Location</label>
        <div className="mb-3 flex gap-2">
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent-cyan/50" />
          <button onClick={useMyLocation} disabled={locating} className="shrink-0 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-2 text-[10px] font-medium text-accent-cyan"><MapPin className="mx-auto h-3.5 w-3.5" />{locating ? "..." : "GPS"}</button>
        </div>

        <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the emergency..." rows={3}
          className="mb-3 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-accent-cyan/50" />

        <label className="mb-2 block text-[10px] font-semibold uppercase text-slate-500">Upload Photo/Video</label>
        <div className="mb-4 flex gap-2">
          {(["camera", "gallery"] as const).map((t) => (
            <button key={t} onClick={() => { setMedia((m) => [...m, `${t}_${m.length + 1}.jpg`]); push(`${t} selected`, "info"); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-[10px] text-slate-300 hover:bg-white/5">
              {t === "camera" ? <Camera className="h-4 w-4" /> : <Image className="h-4 w-4" />}{t === "camera" ? "Camera" : "Gallery"}
            </button>
          ))}
        </div>
        {media.length > 0 && <div className="mb-3 flex flex-wrap gap-1">{media.map((f, i) => <span key={i} className="rounded bg-emergency-emerald/15 px-2 py-0.5 text-[9px] text-emergency-emerald">{f}</span>)}</div>}

        <button onClick={submit} disabled={submitting} className="glow-red w-full rounded-xl bg-emergency-red py-3 text-sm font-bold uppercase text-white hover:bg-red-600 disabled:opacity-50">
          {submitting ? "Submitting..." : online ? "Submit Alert" : "Save Emergency Offline"}
        </button>
      </div>
    </div>
  );
}
