import type { CompanyProfile } from "@/lib/types/company-profile";

export const PROFILE_STORAGE_KEY = "ss2-company-profile";
export const PROFILE_COMMITTED_EVENT = "ss2-company-profile-committed";

export function saveProfile(profile: CompanyProfile): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadStoredProfile(): CompanyProfile | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CompanyProfile;
  } catch {
    return null;
  }
}

export function commitProfile(profile: CompanyProfile): void {
  saveProfile(profile);
  window.dispatchEvent(
    new CustomEvent(PROFILE_COMMITTED_EVENT, { detail: { profile } }),
  );
}
