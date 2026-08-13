import { useEffect, useRef, useState } from "react";

export interface LiveEvent {
  type: string;
  payload: any;
}

/**
 * Connects to the ResQ-X backend's /ws/live socket and exposes the most
 * recent event. Reconnects automatically with backoff if the connection
 * drops (e.g. backend restart).
 */
export function useWebSocket() {
  const [lastEvent, setLastEvent] = useState<LiveEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const retryRef = useRef(1000);

  useEffect(() => {
    let socket: WebSocket;
    let cancelled = false;

    function connect() {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      socket = new WebSocket(`${proto}://${window.location.host}/ws/live`);

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
      socket.onerror = () => socket.close();
    }

    connect();
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, []);

  return { lastEvent, connected };
}
