import type { OpportunityMapPayload } from "@/lib/types/opportunity";
import type { AlertWatch } from "@/lib/bonus/alerts";

export const MAP_PAYLOAD_KEY = "ss2-map-payload";
export const ALERT_WATCH_KEY = "ss2-alert-watches";

export function saveMapPayload(payload: OpportunityMapPayload): void {
  sessionStorage.setItem(MAP_PAYLOAD_KEY, JSON.stringify(payload));
}

export function loadMapPayload(): OpportunityMapPayload | null {
  const raw = sessionStorage.getItem(MAP_PAYLOAD_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OpportunityMapPayload;
  } catch {
    return null;
  }
}

export function loadAlertWatches(): AlertWatch[] {
  const raw = sessionStorage.getItem(ALERT_WATCH_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AlertWatch[];
  } catch {
    return [];
  }
}

export function saveAlertWatches(watches: AlertWatch[]): void {
  sessionStorage.setItem(ALERT_WATCH_KEY, JSON.stringify(watches));
}
