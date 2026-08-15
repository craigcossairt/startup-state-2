import { deriveOperatesInUtah } from "@/lib/profile/must-haves";
import { emptyCompanyProfile } from "@/lib/profile/empty";
import {
  MUST_HAVE_KEYS,
  type CompanyProfile,
} from "@/lib/types/company-profile";
import { callGrokJson } from "./client";
import { INFER_SYSTEM, inferUserPrompt } from "./prompts";

export async function inferCompanyProfile(
  sentence: string,
  known: Partial<CompanyProfile> = {},
): Promise<CompanyProfile> {
  const knownFields = { ...emptyCompanyProfile(), ...known };
  const parsed = (await callGrokJson({
    system: INFER_SYSTEM,
    user: inferUserPrompt(sentence, JSON.stringify(knownFields, null, 2)),
    reasoningEffort: "low",
  })) as CompanyProfile;
  const merged: CompanyProfile = {
    ...emptyCompanyProfile(),
    ...parsed,
    fixtureId: undefined,
  };
  return deriveOperatesInUtah(keepKnownFields(merged, known));
}

function keepKnownFields(
  profile: CompanyProfile,
  known: Partial<CompanyProfile>,
): CompanyProfile {
  let next = profile;
  for (const key of MUST_HAVE_KEYS) {
    const provided = known[key];
    if (
      provided?.status === "known" &&
      provided.value !== undefined &&
      next[key].status === "missing"
    ) {
      next = {
        ...next,
        [key]: provided,
      };
    }
  }
  return next;
}
