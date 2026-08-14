import type { CompanyProfile } from "@/lib/types/company-profile";
import { PROFILE_STORAGE_KEY } from "@/lib/session-profile";

export type ReadableStorage = {
  getItem(key: string): string | null;
};

export function restoreLastCompanyProfile(
  storage: ReadableStorage,
): CompanyProfile | null {
  const raw = storage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CompanyProfile;
  } catch {
    return null;
  }
}
