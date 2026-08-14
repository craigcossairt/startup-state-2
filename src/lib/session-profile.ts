import type { CompanyProfile } from "@/lib/types/company-profile";

export const PROFILE_STORAGE_KEY = "ss2-company-profile";

export function saveProfile(profile: CompanyProfile): void {
  sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadStoredProfile(): CompanyProfile | null {
  const raw = sessionStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CompanyProfile;
  } catch {
    return null;
  }
}
