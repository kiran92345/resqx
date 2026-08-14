import { useEffect, useRef, useState } from "react";

export interface LiveEvent {
  type: string;
  payload: any;
}

/** Skip WebSocket when frontend is deployed without a backend (e.g. Vercel-only). */
function shouldUseWebSocket(): boolean {
  if (import.meta.env.VITE_ENABLE_WS === "false") return false;
  if (import.meta.env.VITE_ENABLE_WS === "true") return true;
  // Default: only connect on local dev (Vite proxy handles /ws)
  return import.meta.env.DEV;
}

/**
 * Connects to /ws/live when a backend is available.
 * On Vercel-only deploys this stays idle so mobile browsers are not stuck retrying.
 */
export function useWebSocket() {
  const [lastEvent, setLastEvent] = useState<LiveEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(1000);

  useEffect(() => {
    if (!shouldUseWebSocket()) return;

    let socket: WebSocket | undefined;
    let cancelled = false;

    function connect() {
      try {
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        socket = new WebSocket(`${proto}://${window.location.host}/ws/live`);
      } catch {
        return;
      }

      socket.onopen = () => {
        setConnected(true);
        retryRef.current = 1000;
      };
      socket.onmessage = (event) => {
        try {
          setLastEvent(JSON.parse(event.data));
        } catch {
          /* ignore malformed frames */
        }
      };
      socket.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          setTimeout(connect, retryRef.current);
          retryRef.current = Math.min(retryRef.current * 2, 15000);
        }
      };
      socket.onerror = () => socket?.close();
    }

    connect();
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, []);

  return { lastEvent, connected };
}
