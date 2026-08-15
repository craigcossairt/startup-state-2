import { FIXTURE_CHIPS } from "@/lib/copy";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type { RetrieveChips } from "@/lib/types/opportunity";

export type SavedSearch = {
  label: string;
  profile: CompanyProfile;
  chips: RetrieveChips;
  seenIds: string[];
  savedAt: string;
};

export function describeSearch(
  profile: CompanyProfile,
  _chips: RetrieveChips = {},
): string {
  const fixture = FIXTURE_CHIPS.find((chip) => chip.id === profile.fixtureId);
  if (fixture) return fixture.label;
  const what = profile.whatTheyDo.value?.trim();
  return what || "This company search";
}

export function subscribeToSearch(input: {
  profile: CompanyProfile;
  chips: RetrieveChips;
  seenIds: string[];
  now?: Date;
}): SavedSearch {
  return {
    label: describeSearch(input.profile, input.chips),
    profile: input.profile,
    chips: input.chips,
    seenIds: [...input.seenIds],
    savedAt: (input.now ?? new Date()).toISOString(),
  };
}

export function newOpportunityIds(
  seenIds: string[],
  retrievedIds: string[],
): string[] {
  const seen = new Set(seenIds);
  return retrievedIds.filter((id) => !seen.has(id));
}
