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
  const next = { ...profile };
  for (const key of MUST_HAVE_KEYS) {
    const field = fieldOf(profile, key);
    if (field.status === "missing" && field.value !== undefined) {
      (next as Record<string, ProfileField<unknown>>)[key] = {
        ...field,
        status: "known",
      };
    }
  }
  return next;
}

export function confirmInferredMustHaves(profile: CompanyProfile): CompanyProfile {
  const next = { ...profile };
  for (const key of inferredMustHaves(profile)) {
    const field = fieldOf(profile, key);
    (next as Record<string, ProfileField<unknown>>)[key] = {
      ...field,
      status: "known",
    };
  }
  return next;
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
