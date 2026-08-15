import { FOOTER_EMAIL } from "@/lib/copy";

export const LEFTOVER_WATCH_MAIL_UNAVAILABLE = `This search is saved on this device. Email alerts are not wired yet. Email ${FOOTER_EMAIL} if you want GOED to watch these filters.`;

export type LeftoverWatchScope = "map" | "talent";

export type LeftoverWatchInput = {
  scope: LeftoverWatchScope;
  email: string;
  label: string;
  filter: Record<string, unknown>;
  cadence: "daily" | "weekly";
};

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
