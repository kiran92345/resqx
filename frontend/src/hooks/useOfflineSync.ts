import { useEffect, useState, useCallback } from "react";
import * as apiClient from "../api/client";
import { getOfflineQueue, markSynced, toIncidentPayload, isOnline } from "../services/offlineEmergency";
import { migrateIncidentId, registerFromApiIncident } from "../services/userEmergencyStore";

export function useOfflineSync(onSynced?: (incidentId: string) => void) {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(() => getOfflineQueue().length);
  const [syncing, setSyncing] = useState(false);

  const syncQueue = useCallback(async () => {
    if (!isOnline() || syncing) return;
    const queue = getOfflineQueue().filter((e) => !e.synced);
    if (queue.length === 0) return;

    setSyncing(true);
    for (const entry of queue) {
      try {
        const inc = await apiClient.createIncident(toIncidentPayload(entry));
        markSynced(entry.localId);
        migrateIncidentId(entry.localId, inc.id);
        registerFromApiIncident(inc, entry.category);
        onSynced?.(inc.id);
      } catch {
        break;
      }
    }
    setPendingCount(getOfflineQueue().length);
    setSyncing(false);
  }, [syncing, onSynced]);

  useEffect(() => {
    const goOnline = () => { setOnline(true); syncQueue(); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    if (isOnline()) syncQueue();
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [syncQueue]);

  return { online, pendingCount, syncing, syncQueue };
}
