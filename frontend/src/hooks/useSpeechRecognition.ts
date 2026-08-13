import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechRecognitionErrorCode =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "aborted"
  | "service-not-allowed"
  | string;

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function friendlySpeechError(code: SpeechRecognitionErrorCode): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access denied. Allow mic permission for this site in your browser.";
    case "no-speech":
      return "No speech detected. Tap the mic and speak clearly.";
    case "audio-capture":
      return "No microphone found. Connect a mic and try again.";
    case "network":
      return "Speech service needs network access. Check your connection.";
    case "aborted":
      return "Listening stopped.";
    default:
      return `Speech recognition failed (${code}). Try again or use demo mode.`;
  }
}

export function useSpeechRecognition(lang: string) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    setSupported(!!Ctor);
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let nextInterim = "";
      let nextFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) nextFinal += piece;
        else nextInterim += piece;
      }

      if (nextInterim.trim()) setInterim(nextInterim.trim());
      if (nextFinal.trim()) {
        const finalText = nextFinal.trim();
        setTranscript((prev) => (prev ? `${prev} ${finalText}` : finalText));
        setInterim("");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      setError(friendlySpeechError(event.error));
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Speech recognition is not supported in this browser. Use Chrome or Edge.");
      return;
    }

    setTranscript("");
    setInterim("");
    setError(null);
    recognition.lang = langRef.current;

    try {
      recognition.start();
    } catch {
      recognition.stop();
      window.setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch {
          setError("Could not start microphone. Wait a moment and try again.");
        }
      }, 200);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    recognitionRef.current?.abort();
    setListening(false);
    setInterim("");
  }, []);

  const reset = useCallback(() => {
    abort();
    setTranscript("");
    setError(null);
  }, [abort]);

  return {
    supported,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    abort,
    reset,
    displayText: interim || transcript,
    hasTranscript: Boolean(transcript.trim()),
  };
}
