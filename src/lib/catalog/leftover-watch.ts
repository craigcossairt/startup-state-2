import { FOOTER_EMAIL } from "@/lib/copy";

export const LEFTOVER_WATCH_MAIL_UNAVAILABLE = `This search is saved on this device. Email alerts are not wired yet. Email ${FOOTER_EMAIL} if you want GOED to watch these filters.`;

export const LEFTOVER_WATCH_STORAGE_KEY = "startup_state.leftover_watch";

export type LeftoverWatchStore = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type LeftoverWatchScope = "map" | "talent";

export type LeftoverWatchInput = {
  scope: LeftoverWatchScope;
  email: string;
  label: string;
  filter: Record<string, unknown>;
  cadence: "daily" | "weekly";
};

export type StoredLeftoverWatch = LeftoverWatchInput & { savedAt: string };

export type LeftoverWatchResult =
  | {
      ok: true;
      mailed: false;
      email: string;
      label: string;
      cadence: "daily" | "weekly";
      message: string;
    }
  | { ok: false; error: string };

export function submitLeftoverWatch(input: LeftoverWatchInput): LeftoverWatchResult {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email." };
  }
  const label = input.label.trim() || "Saved search";
  return {
    ok: true,
    mailed: false,
    email,
    label,
    cadence: input.cadence,
    message: LEFTOVER_WATCH_MAIL_UNAVAILABLE,
  };
}

export function persistLeftoverWatch(
  input: LeftoverWatchInput,
  storage: LeftoverWatchStore,
  now: () => string = () => new Date().toISOString(),
): LeftoverWatchResult {
  const result = submitLeftoverWatch(input);
  if (!result.ok) return result;
  const existing = parseStoredLeftoverWatches(storage.getItem(LEFTOVER_WATCH_STORAGE_KEY));
  existing.push({
    scope: input.scope,
    email: result.email,
    label: result.label,
    filter: input.filter,
    cadence: result.cadence,
    savedAt: now(),
  });
  storage.setItem(LEFTOVER_WATCH_STORAGE_KEY, JSON.stringify(existing));
  return result;
}

export function parseStoredLeftoverWatches(raw: string | null): StoredLeftoverWatch[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredLeftoverWatch);
  } catch {
    return [];
  }
}

function isStoredLeftoverWatch(value: unknown): value is StoredLeftoverWatch {
  if (!value || typeof value !== "object") return false;
  const row = value as StoredLeftoverWatch;
  return (
    (row.scope === "map" || row.scope === "talent") &&
    typeof row.email === "string" &&
    typeof row.label === "string" &&
    typeof row.cadence === "string" &&
    typeof row.savedAt === "string"
  );
}
