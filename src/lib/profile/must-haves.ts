import { DEFAULT_HQ_COUNTRY, DEFAULT_HQ_STATE } from "@/lib/labels";
import {
  MUST_HAVE_KEYS,
  type CompanyProfile,
  type MustHaveKey,
  type ProfileField,
} from "@/lib/types/company-profile";

function fieldOf(profile: CompanyProfile, key: MustHaveKey): ProfileField<unknown> {
  return profile[key] as ProfileField<unknown>;
}

export function missingMustHaves(profile: CompanyProfile): MustHaveKey[] {
  return MUST_HAVE_KEYS.filter((key) => fieldOf(profile, key).status === "missing");
}

export function inferredMustHaves(profile: CompanyProfile): MustHaveKey[] {
  return MUST_HAVE_KEYS.filter((key) => fieldOf(profile, key).status === "inferred");
}

export function allMustHavesKnown(profile: CompanyProfile): boolean {
  return MUST_HAVE_KEYS.every((key) => fieldOf(profile, key).status === "known");
}

export function applyMustHaveDraft<K extends MustHaveKey>(
  profile: CompanyProfile,
  key: K,
  value: CompanyProfile[K]["value"],
): CompanyProfile {
  const field = fieldOf(profile, key);
  return {
    ...profile,
    [key]: {
      ...field,
      value,
    },
  };
}

export function promoteFilledMustHaves(profile: CompanyProfile): CompanyProfile {
  let next: CompanyProfile = { ...profile };
  for (const key of MUST_HAVE_KEYS) {
    const field = fieldOf(profile, key);
    if (field.status === "missing" && field.value !== undefined) {
      next = {
        ...next,
        [key]: {
          ...field,
          status: "known",
        },
      };
    }
  }
  return next;
}

export function confirmInferredMustHaves(profile: CompanyProfile): CompanyProfile {
  let next: CompanyProfile = { ...profile };
  for (const key of inferredMustHaves(profile)) {
    const field = fieldOf(profile, key);
    next = {
      ...next,
      [key]: {
        ...field,
        status: "known",
      },
    };
  }
  return next;
}

export function seedLocationDefaults(profile: CompanyProfile): CompanyProfile {
  let next = profile;
  if (profile.hqCountry.status === "missing" && profile.hqCountry.value === undefined) {
    next = applyMustHaveDraft(next, "hqCountry", DEFAULT_HQ_COUNTRY);
  }
  if (profile.hqState.status === "missing" && profile.hqState.value === undefined) {
    next = applyMustHaveDraft(next, "hqState", DEFAULT_HQ_STATE);
  }
  return next;
}

export function locationKnownFields(country: string, state: string): Pick<
  CompanyProfile,
  "hqCountry" | "hqState"
> {
  return {
    hqCountry: { status: "known", value: country },
    hqState: { status: "known", value: state },
  };
}

export function deriveOperatesInUtah(profile: CompanyProfile): CompanyProfile {
  const state = profile.hqState.value;
  if (profile.hqState.status !== "known" || !state) {
    return profile;
  }
  return {
    ...profile,
    operatesInUtah: { status: "known", value: state.toUpperCase() === "UT" },
  };
}
