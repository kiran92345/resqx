const STORAGE_KEY = "resqx_my_incidents";

export function getUserIncidentIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addUserIncident(id: string) {
  const ids = getUserIncidentIds();
  if (!ids.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([id, ...ids]));
  }
}

export function isUserIncident(id: string): boolean {
  return getUserIncidentIds().includes(id);
}
