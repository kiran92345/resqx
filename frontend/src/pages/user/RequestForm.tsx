import React, { useState } from "react";
import { Send, MapPin, TriangleAlert } from "lucide-react";
import * as apiClient from "../../api/client";
import type { DisasterType } from "../../types";
import { useToast } from "../../components/common/Toast";

export function RequestForm({ onSubmitted }: { onSubmitted?: (incidentId: string) => void }) {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [disasterType, setDisasterType] = useState<DisasterType>("flood");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [affected, setAffected] = useState("");
  const [injured, setInjured] = useState("");
  const [children, setChildren] = useState("");
  const [elderly, setElderly] = useState("");
  const [needs, setNeeds] = useState({
    food: false,
    water: false,
    medical: false,
    shelter: false,
    rescue_team: false,
  });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function validateLive() {
    const w: string[] = [];
    const a = Number(affected) || 0;
    const i = Number(injured) || 0;
    const c = Number(children) || 0;
    const e = Number(elderly) || 0;
    if (i > a) w.push("Injured count exceeds total affected count");
    if (c + e > a) w.push("Children + elderly count exceeds total affected count");
    if (a > 50000) w.push("Affected count unusually high — please verify");
    setWarnings(w);
  }

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
      },
      () => push("Couldn't get your location — enter it manually.", "warning")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const incident = await apiClient.createIncident({
        name,
        coordinates: [Number(lat) || 0, Number(lng) || 0],
        disaster_type: disasterType,
        affected_count: Number(affected) || 0,
        injured_count: Number(injured) || 0,
        children_count: Number(children) || 0,
        elderly_count: Number(elderly) || 0,
        needs,
      });
      push(`Request submitted — priority: ${incident.priority_level}`, "info");
      onSubmitted?.(incident.id);
    } catch {
      push("Couldn't submit your request. Please try again.", "warning");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-bold">Request Emergency Assistance</h1>
        <p className="text-sm text-slate-400">Fill in what you know — you can update details later.</p>
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-400">Location / zone name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emergency-red"
          placeholder="e.g. Riverside Colony, Block C"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-400">Latitude</label>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-400">Longitude</label>
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-400 hover:text-slate-100"
          >
            <MapPin className="h-3.5 w-3.5" /> Use my location
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-400">Disaster type</label>
        <select
          value={disasterType}
          onChange={(e) => setDisasterType(e.target.value as DisasterType)}
          className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="flood">Flood</option>
          <option value="fire">Fire</option>
          <option value="earthquake">Earthquake</option>
          <option value="outbreak">Outbreak</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Total affected individuals", affected, setAffected],
          ["Critical injuries", injured, setInjured],
          ["Children count", children, setChildren],
          ["Elderly count", elderly, setElderly],
        ].map(([label, value, setter]: any) => (
          <div key={label}>
            <label className="mb-1 block text-xs text-slate-400">{label}</label>
            <input
              type="number"
              min={0}
              value={value}
              onChange={(e) => {
                setter(e.target.value);
                setTimeout(validateLive, 0);
              }}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-300">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="list-inside list-disc space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs text-slate-400">Immediate needs</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(needs) as (keyof typeof needs)[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setNeeds((n) => ({ ...n, [k]: !n[k] }))}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                needs[k]
                  ? "border-emergency-red bg-emergency-red/15 text-emergency-red"
                  : "border-slate-800 text-slate-400"
              }`}
            >
              {k.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emergency-red py-3 text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
