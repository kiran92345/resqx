import React, { useState, useEffect, useRef } from "react";
import { X, Mic, MicOff } from "lucide-react";
import clsx from "clsx";
import { EMERGENCY_CATEGORIES, type EmergencyCategoryId } from "../../data/mockDashboard";
import { HYDERABAD_USER_LOCATION } from "../../data/indiaLocations";
import { useToast } from "../common/Toast";

const DEMO_TRANSCRIPTS = [
  "Help! There is a car accident near my location.",
  "Medical emergency — person collapsed, need ambulance immediately.",
  "Fire outbreak in building, people trapped on third floor.",
  "Heavy flooding on the road, vehicles stranded.",
];

interface VoiceEmergencyModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: {
    category: EmergencyCategoryId;
    transcript: string;
    coordinates: [number, number];
    location: string;
  }) => void;
}

export function VoiceEmergencyModal({ open, onClose, onComplete }: VoiceEmergencyModalProps) {
  const { push } = useToast();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [category, setCategory] = useState<EmergencyCategoryId>("accident");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setListening(false);
      setTranscript("");
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  }, [open]);

  if (!open) return null;

  function classify(text: string): EmergencyCategoryId {
    const t = text.toLowerCase();
    if (t.includes("fire")) return "fire";
    if (t.includes("medical") || t.includes("ambulance") || t.includes("collapsed")) return "medical";
    if (t.includes("flood")) return "flood";
    if (t.includes("crime") || t.includes("robbery")) return "crime";
    if (t.includes("accident") || t.includes("car")) return "accident";
    return "other";
  }

  function startListening() {
    setListening(true);
    setTranscript("Listening…");
    timerRef.current = window.setTimeout(() => {
      const text = DEMO_TRANSCRIPTS[Math.floor(Math.random() * DEMO_TRANSCRIPTS.length)];
      setTranscript(text);
      setCategory(classify(text));
      setListening(false);
      push("Voice transcribed (demo STT)", "info");
    }, 2200);
  }

  function submit() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        onComplete({
          category,
          transcript,
          coordinates: coords,
          location: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`,
        });
      },
      () => {
        onComplete({
          category,
          transcript,
          coordinates: HYDERABAD_USER_LOCATION,
          location: "Banjara Hills, Hyderabad",
        });
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="glass-card w-full max-w-lg rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Voice Emergency</h2>
            <p className="text-xs text-slate-400">Speak clearly — Hindi, English & Telugu supported (demo)</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-6 flex justify-center">
          <button
            onClick={listening ? undefined : startListening}
            className={clsx(
              "flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 transition",
              listening
                ? "animate-pulse border-emergency-red bg-emergency-red/20"
                : "border-accent-cyan/50 bg-accent-cyan/10 hover:bg-accent-cyan/20"
            )}
          >
            {listening ? <MicOff className="h-10 w-10 text-emergency-red" /> : <Mic className="h-10 w-10 text-accent-cyan" />}
            <span className="mt-2 text-[10px] font-semibold uppercase text-slate-300">
              {listening ? "Listening…" : "Tap to Speak"}
            </span>
          </button>
        </div>

        {transcript && !listening && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase text-slate-500">Transcript</p>
            <p className="mt-1 text-sm text-white">{transcript}</p>
            <p className="mt-2 text-[10px] text-accent-cyan">AI classified: {category.replace("_", " ")}</p>
          </div>
        )}

        <button
          onClick={submit}
          disabled={!transcript || listening}
          className="glow-red w-full rounded-xl bg-emergency-red py-3 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          Send Voice Emergency
        </button>
      </div>
    </div>
  );
}
