import {
  YOU_CHANGED_EVENT,
  YOU_STORAGE_KEY,
  type YouPersona,
} from "@/lib/catalog/you-persona";
import {
  confirmInferredMustHaves,
  missingMustHaves,
  promoteFilledMustHaves,
} from "@/lib/profile/must-haves";
import { profileCacheKey } from "@/lib/session-map";
import { commitProfile } from "@/lib/session-profile";
import {
  MUST_HAVE_KEYS,
  type CompanyProfile,
  type FixtureId,
  type MustHaveKey,
} from "@/lib/types/company-profile";

export type BarDraft =
  | { mode: "persona"; persona: YouPersona }
  | { mode: "dual"; persona: YouPersona; profile: CompanyProfile };

export type BarStrip =
  | { kind: "intake-cta"; persona: YouPersona | null }
  | { kind: "invite" }
  | { kind: "summary"; persona: YouPersona };

export type BarApplyVerdict =
  | { status: "ready"; mode: "persona"; persona: YouPersona }
  | { status: "ready"; mode: "dual"; persona: YouPersona; profile: CompanyProfile }
  | { status: "blocked"; missing: MustHaveKey[] };

export type YouBarOpenSource = "strip" | "map-hero";

export type BarSurfaceInput = {
  pathname: string;
  persona: YouPersona;
  personaFilled: boolean;
  profile: CompanyProfile | null;
  fixtureId?: FixtureId | null;
};

export const YOU_BAR_TOGGLE_EVENT = "you-bar-toggle";
export const YOU_BAR_OPEN_EVENT = "you-bar-open-changed";

export function isMapPath(pathname: string): boolean {
  return pathname === "/map" || pathname === "/map/";
}

export function youBarStrip(input: BarSurfaceInput): BarStrip {
  if (isMapPath(input.pathname) && !input.profile && !input.fixtureId) {
    return { kind: "intake-cta", persona: input.personaFilled ? input.persona : null };
  }
  if (!input.personaFilled) return { kind: "invite" };
  return { kind: "summary", persona: input.persona };
}

export function beginYouBarDraft(input: {
  pathname: string;
  persona: YouPersona;
  profile: CompanyProfile | null;
}): BarDraft {
  if (isMapPath(input.pathname) && input.profile) {
    return { mode: "dual", persona: input.persona, profile: input.profile };
  }
  return { mode: "persona", persona: input.persona };
}

export function hasMustHaveValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    if ("amountUsd" in value) {
      return Number.isFinite((value as { amountUsd: number }).amountUsd);
    }
    if ("minUsd" in value && "maxUsd" in value) {
      const range = value as { minUsd: number; maxUsd: number };
      return Number.isFinite(range.minUsd) && Number.isFinite(range.maxUsd);
    }
    if ("min" in value && "max" in value) {
      const range = value as { min: number; max: number };
      return Number.isFinite(range.min) && Number.isFinite(range.max);
    }
  }
  return true;
}

export function emptyMustHaveValues(profile: CompanyProfile): MustHaveKey[] {
  return MUST_HAVE_KEYS.filter((key) => !hasMustHaveValue(profile[key].value));
}

export function prepareBarApply(draft: BarDraft): BarApplyVerdict {
  if (draft.mode === "persona") {
    return { status: "ready", mode: "persona", persona: draft.persona };
  }
  const ready = confirmInferredMustHaves(promoteFilledMustHaves(draft.profile));
  const missing = [
    ...new Set([...missingMustHaves(ready), ...emptyMustHaveValues(ready)]),
  ];
  if (missing.length > 0) return { status: "blocked", missing };
  return { status: "ready", mode: "dual", persona: draft.persona, profile: ready };
}

export function neededMustHaves(draft: BarDraft): MustHaveKey[] {
  const verdict = prepareBarApply(draft);
  return verdict.status === "blocked" ? verdict.missing : [];
}

export function persistBarApply(
  verdict: Extract<BarApplyVerdict, { status: "ready" }>,
  shell: { replaceUrl: (persona: YouPersona) => void },
): void {
  window.localStorage.setItem(YOU_STORAGE_KEY, JSON.stringify(verdict.persona));
  window.dispatchEvent(new CustomEvent(YOU_CHANGED_EVENT));
  shell.replaceUrl(verdict.persona);
  if (verdict.mode === "dual") commitProfile(verdict.profile);
}

export function requestYouBarToggle(source: YouBarOpenSource = "strip"): void {
  window.dispatchEvent(new CustomEvent(YOU_BAR_TOGGLE_EVENT, { detail: { source } }));
}

export function announceYouBarOpen(open: boolean): void {
  window.dispatchEvent(new CustomEvent(YOU_BAR_OPEN_EVENT, { detail: { open } }));
}

export function appliedProfileNeedsLiveRank(
  previous: CompanyProfile | null,
  next: CompanyProfile,
): boolean {
  if (!previous) return true;
  return profileCacheKey(previous) !== profileCacheKey(next);
}

export function toggleSourceFromEvent(event: Event): YouBarOpenSource {
  const source = (event as CustomEvent<{ source?: YouBarOpenSource }>).detail?.source;
  return source === "map-hero" ? "map-hero" : "strip";
}

/** Keep an active map rail `?fixture=` when persona params would otherwise drop it. */
export function withPreservedRailFixture(
  params: URLSearchParams,
  railFixture: FixtureId | null | undefined,
): URLSearchParams {
  if (railFixture && !params.get("fixture")) {
    params.set("fixture", railFixture);
  }
  return params;
}
