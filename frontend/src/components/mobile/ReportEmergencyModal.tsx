import React, { useState, useEffect } from "react";
import { X, Heart, Flame, Car, Waves, ShieldAlert, MoreHorizontal, MapPin, Camera, Image, Mic, WifiOff, Loader2, Navigation } from "lucide-react";
import clsx from "clsx";
import { EMERGENCY_CATEGORIES, type EmergencyCategoryId } from "../../data/mockDashboard";
import { useToast } from "../common/Toast";
import * as apiClient from "../../api/client";
import { isOnline, queueOfflineEmergency, toIncidentPayload } from "../../services/offlineEmergency";
import { registerFromApiIncident, registerFromOffline } from "../../services/userEmergencyStore";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import { formatCoordinates, resolveLiveLocation } from "../../services/geolocation";
import { HYDERABAD_USER_LOCATION } from "../../data/indiaLocations";

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
  const [description, setDescription] = useState(initialDescription ?? "");
  const [media, setMedia] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const online = isOnline();

  const liveLocation = useLiveLocation({
    enabled: open,
    autoFetch: !initialCoords,
    initialCoords,
    initialLocation,
  });

  useEffect(() => {
    if (open) {
      if (initialCategory) setCategory(initialCategory);
      if (initialDescription) setDescription(initialDescription);
    }
  }, [open, initialCategory, initialDescription]);

  useEffect(() => {
    if (liveLocation.error) push(liveLocation.error, "warning");
  }, [liveLocation.error, push]);

  if (!open) return null;

  async function submit() {
    setSubmitting(true);

    let coordinates = liveLocation.coordinates;
    let location = liveLocation.locationLabel.trim();

    if (liveLocation.status !== "ready" || !liveLocation.gpsLocked) {
      const resolved = await resolveLiveLocation(
        liveLocation.gpsLocked ? coordinates : HYDERABAD_USER_LOCATION,
        location || "Banjara Hills, Hyderabad (approximate)"
      );
      coordinates = resolved.coordinates;
      location = resolved.label;
      if (resolved.source === "gps") {
        push("Live location captured", "info");
      } else if (!liveLocation.gpsLocked) {
        push("Could not get live GPS — using approximate location. Enable location permission.", "warning");
      }
    }

    if (!location) {
      location = formatCoordinates(coordinates);
    }

    const entry = {
      category,
      location,
      coordinates,
      description,
      voiceTranscript,
      media,
    };

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

  const locating = liveLocation.status === "detecting";
  const locationReady = liveLocation.status === "ready" && liveLocation.gpsLocked;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-sheet">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">REPORT AN EMERGENCY</h2>
            <p className="text-xs text-[var(--text-muted)]">Stay Calm, We are Here to Help!</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"><X className="h-5 w-5" /></button>
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

        <p className="mb-2 text-[10px] font-semibold uppercase text-[var(--text-faint)]">Category</p>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EMERGENCY_CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.icon as keyof typeof ICONS];
            return (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={clsx(
                "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition",
                category === cat.id ? `${TINTS[cat.tint]} ring-1 ring-white/20` : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
              )}><Icon className="h-5 w-5" /><span className="text-[9px] font-medium">{cat.label}</span></button>
            );
          })}
        </div>

        <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--text-faint)]">Location</label>
        <div className="mb-2 flex gap-2">
          <input
            value={liveLocation.locationLabel}
            onChange={(e) => liveLocation.setLocationLabel(e.target.value)}
            placeholder={locating ? "Detecting live location…" : "Address or landmark"}
            className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-accent-cyan/50"
          />
          <button
            type="button"
            onClick={() => liveLocation.refresh()}
            disabled={locating}
            className="shrink-0 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-2 text-[10px] font-medium text-accent-cyan disabled:opacity-50"
          >
            {locating ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : <Navigation className="mx-auto h-3.5 w-3.5" />}
            {locating ? "…" : "GPS"}
          </button>
        </div>

        <div
          className={clsx(
            "mb-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px]",
            locationReady
              ? "border-emergency-emerald/30 bg-emergency-emerald/10 text-emergency-emerald"
              : locating
                ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                : "border-emergency-amber/30 bg-emergency-amber/10 text-emergency-amber"
          )}
        >
          {locating ? (
            <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin" />
          ) : (
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <div className="min-w-0">
            {locating && <p>Detecting your live GPS location…</p>}
            {!locating && locationReady && (
              <>
                <p className="font-semibold">Live location locked</p>
                <p className="opacity-90">{formatCoordinates(liveLocation.coordinates)}</p>
                {liveLocation.accuracy != null && (
                  <p className="opacity-80">Accuracy ±{Math.round(liveLocation.accuracy)}m</p>
                )}
              </>
            )}
            {!locating && !locationReady && (
              <p>
                {liveLocation.isSupported
                  ? "Tap GPS to capture your live location before submitting."
                  : "Use HTTPS/localhost for live GPS, or enter your address manually."}
              </p>
            )}
          </div>
        </div>

        <label className="mb-1 block text-[10px] font-semibold uppercase text-[var(--text-faint)]">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the emergency..." rows={3}
          className="mb-3 w-full resize-none rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-accent-cyan/50" />

        <label className="mb-2 block text-[10px] font-semibold uppercase text-[var(--text-faint)]">Upload Photo/Video</label>
        <div className="mb-4 flex gap-2">
          {(["camera", "gallery"] as const).map((t) => (
            <button key={t} type="button" onClick={() => { setMedia((m) => [...m, `${t}_${m.length + 1}.jpg`]); push(`${t} selected`, "info"); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] py-2 text-[10px] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]">
              {t === "camera" ? <Camera className="h-4 w-4" /> : <Image className="h-4 w-4" />}{t === "camera" ? "Camera" : "Gallery"}
            </button>
          ))}
        </div>
        {media.length > 0 && <div className="mb-3 flex flex-wrap gap-1">{media.map((f, i) => <span key={i} className="rounded bg-emergency-emerald/15 px-2 py-0.5 text-[9px] text-emergency-emerald">{f}</span>)}</div>}

        <button type="button" onClick={submit} disabled={submitting || locating} className="glow-red w-full rounded-xl bg-emergency-red py-3 text-sm font-bold uppercase text-white hover:bg-red-600 disabled:opacity-50">
          {submitting ? "Submitting..." : locating ? "Getting location…" : online ? "Submit Alert" : "Save Emergency Offline"}
        </button>
      </div>
    </div>
  );
}
