import type { EmergencyCategoryId } from "../data/mockDashboard";

export interface PendingEmergency {
  localId: string;
  category: EmergencyCategoryId;
  location: string;
  coordinates: [number, number];
  description: string;
  voiceTranscript?: string;
  media: string[];
  createdAt: string;
  synced: boolean;
}

const STORAGE_KEY = "resqx_offline_queue";

export function getOfflineQueue(): PendingEmergency[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingEmergency[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function queueOfflineEmergency(payload: Omit<PendingEmergency, "localId" | "createdAt" | "synced">): PendingEmergency {
  const entry: PendingEmergency = {
    ...payload,
    localId: `offline-${Date.now()}`,
    createdAt: new Date().toISOString(),
    synced: false,
  };
  const queue = getOfflineQueue();
  queue.unshift(entry);
  saveQueue(queue);
  return entry;
}

export function markSynced(localId: string) {
  const queue = getOfflineQueue().map((e) => (e.localId === localId ? { ...e, synced: true } : e));
  saveQueue(queue.filter((e) => !e.synced));
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

const DISASTER: Record<EmergencyCategoryId, string> = {
  medical: "outbreak",
  fire: "fire",
  accident: "other",
  flood: "flood",
  crime: "other",
  other: "other",
};

export function toIncidentPayload(entry: PendingEmergency) {
  const category = entry.category;
  return {
    name: entry.location.split(",")[0] || "Emergency",
    coordinates: entry.coordinates,
    disaster_type: DISASTER[category],
    affected_count: 1,
    injured_count: category === "medical" ? 1 : 0,
    children_count: 0,
    elderly_count: 0,
    needs: {
      food: false,
      water: false,
      medical: category === "medical",
      shelter: category === "flood",
      rescue_team: true,
    },
    notes: [entry.description, entry.voiceTranscript].filter(Boolean).join(" | ") || undefined,
  };
}
