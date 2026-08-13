import React, { useEffect, useState } from "react";
import { X, Mic, MicOff, RotateCcw, Globe } from "lucide-react";
import clsx from "clsx";
import type { EmergencyCategoryId } from "../../data/mockDashboard";
import { HYDERABAD_USER_LOCATION } from "../../data/indiaLocations";
import { resolveLiveLocation } from "../../services/geolocation";
import { useToast } from "../common/Toast";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import {
  VOICE_LANGUAGES,
  type VoiceLanguageId,
  classifyEmergencyFromVoice,
} from "../../utils/voiceClassification";

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
  const [language, setLanguage] = useState<VoiceLanguageId>("en-IN");
  const [category, setCategory] = useState<EmergencyCategoryId>("other");
  const [demoMode, setDemoMode] = useState(false);
  const [demoTranscript, setDemoTranscript] = useState("");
  const [submittingLocation, setSubmittingLocation] = useState(false);

  const speech = useSpeechRecognition(language);

  useEffect(() => {
    if (!open) {
      speech.abort();
      speech.reset();
      setDemoMode(false);
      setDemoTranscript("");
      setCategory("other");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const text = demoMode ? demoTranscript : speech.transcript;
    if (text.trim()) setCategory(classifyEmergencyFromVoice(text));
  }, [speech.transcript, demoTranscript, demoMode]);

  useEffect(() => {
    if (speech.error) push(speech.error, "warning");
  }, [speech.error, push]);

  if (!open) return null;

  function toggleListening() {
    if (demoMode) return;
    if (speech.listening) speech.stop();
    else speech.start();
  }

  function runDemoTranscript() {
    speech.abort();
    setDemoMode(true);
    const text = DEMO_TRANSCRIPTS[Math.floor(Math.random() * DEMO_TRANSCRIPTS.length)];
    setDemoTranscript(text);
    setCategory(classifyEmergencyFromVoice(text));
    push("Demo transcript loaded — use Chrome/Edge for live voice", "info");
  }

  function clearTranscript() {
    setDemoMode(false);
    setDemoTranscript("");
    speech.reset();
    setCategory("other");
  }

  const activeTranscript = demoMode ? demoTranscript : speech.transcript.trim();
  const livePreview = demoMode ? demoTranscript : speech.displayText;
  const canSubmit = Boolean(activeTranscript) && !speech.listening && !submittingLocation;

  async function submit() {
    if (!canSubmit) return;

    const finalTranscript = activeTranscript;
    const finalCategory = classifyEmergencyFromVoice(finalTranscript);

    setSubmittingLocation(true);
    try {
      const resolved = await resolveLiveLocation(
        HYDERABAD_USER_LOCATION,
        "Banjara Hills, Hyderabad (approximate)"
      );
      if (resolved.source === "gps") {
        push("Live location captured for voice report", "info");
      } else {
        push("Could not get live GPS — enable location permission for accurate dispatch.", "warning");
      }
      onComplete({
        category: finalCategory,
        transcript: finalTranscript,
        coordinates: resolved.coordinates,
        location: resolved.label,
      });
    } finally {
      setSubmittingLocation(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-sheet w-full max-w-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Voice Emergency</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Speak clearly — real-time transcription via your browser microphone
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 shrink-0 text-accent-cyan" />
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value as VoiceLanguageId);
              clearTranscript();
            }}
            disabled={speech.listening}
            className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-accent-cyan/50"
          >
            {VOICE_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {!speech.supported && (
          <p className="mb-3 rounded-lg border border-emergency-amber/30 bg-emergency-amber/10 px-3 py-2 text-xs text-emergency-amber">
            Live speech recognition needs Chrome or Edge. You can use demo mode below.
          </p>
        )}

        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={toggleListening}
            disabled={demoMode || !speech.supported}
            className={clsx(
              "relative flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 transition",
              speech.listening
                ? "animate-pulse border-emergency-red bg-emergency-red/20"
                : "border-accent-cyan/50 bg-accent-cyan/10 hover:bg-accent-cyan/20",
              (demoMode || !speech.supported) && "cursor-not-allowed opacity-50"
            )}
          >
            {speech.listening && (
              <>
                <span className="voice-mic-ring voice-mic-ring--a" aria-hidden />
                <span className="voice-mic-ring voice-mic-ring--b" aria-hidden />
              </>
            )}
            {speech.listening ? (
              <MicOff className="relative z-10 h-10 w-10 text-emergency-red" />
            ) : (
              <Mic className="relative z-10 h-10 w-10 text-accent-cyan" />
            )}
            <span className="relative z-10 mt-2 text-[10px] font-semibold uppercase text-[var(--text-muted)]">
              {speech.listening ? "Tap to Stop" : "Tap to Speak"}
            </span>
          </button>
        </div>

        <div className="mb-4 min-h-[5.5rem] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
          <p className="text-[10px] font-semibold uppercase text-[var(--text-faint)]">Live transcript</p>
          {livePreview ? (
            <p className="mt-1 text-sm text-[var(--text-primary)]">
              {livePreview}
              {speech.listening && speech.interim && (
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent-cyan align-middle" />
              )}
            </p>
          ) : (
            <p className="mt-1 text-sm italic text-[var(--text-faint)]">
              {speech.listening ? "Listening… speak now" : "Your words will appear here"}
            </p>
          )}
          {activeTranscript && !speech.listening && (
            <p className="mt-2 text-[10px] font-medium text-accent-cyan">
              AI classified: {category.replace("_", " ")}
            </p>
          )}
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={clearTranscript}
            disabled={speech.listening}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)] disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
          {!speech.supported && (
            <button
              type="button"
              onClick={runDemoTranscript}
              disabled={speech.listening}
              className="flex-1 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-2 text-xs font-medium text-accent-cyan hover:bg-accent-cyan/15 disabled:opacity-40"
            >
              Use Demo Transcript
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="glow-red w-full rounded-xl bg-emergency-red py-3 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          {submittingLocation ? "Getting location…" : "Send Voice Emergency"}
        </button>
      </div>
    </div>
  );
}
