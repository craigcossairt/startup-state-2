import type { CompanyProfile } from "@/lib/types/company-profile";
import type { OpportunityMapPayload, RetrieveChips } from "@/lib/types/opportunity";
import type { SavedSearch } from "@/lib/bonus/alerts";

export const MAP_PAYLOAD_KEY = "ss2-map-payload";
export const MAP_CACHE_KEY = "ss2-map-cache";
export const SAVED_SEARCH_KEY = "ss2-saved-search";

export type MapStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type MapCacheRecord = {
  key: string;
  profile: CompanyProfile;
  chips: RetrieveChips;
  payload: OpportunityMapPayload;
};

function sessionStore(): MapStorage | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

function localStore(): MapStorage | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function browserStore(): MapStorage | null {
  return sessionStore();
}

function profileFields(profile: CompanyProfile) {
  return {
    fixtureId: profile.fixtureId ?? null,
    whatTheyDo: profile.whatTheyDo.value ?? null,
    technologies: profile.technologies.value ?? null,
    sectors: profile.sectors.value ?? null,
    hqCountry: profile.hqCountry.value ?? null,
    hqState: profile.hqState.value ?? null,
    employeeCount: profile.employeeCount.value ?? null,
    revenue: profile.revenue.value ?? null,
    capitalRaisedUsd: profile.capitalRaisedUsd.value ?? null,
    capitalNeedUsd: profile.capitalNeedUsd.value ?? null,
    useOfFunds: profile.useOfFunds.value ?? null,
  };
}

export function profileCacheKey(profile: CompanyProfile): string {
  return JSON.stringify(profileFields(profile));
}

export function isSameCompanySearch(a: CompanyProfile, b: CompanyProfile): boolean {
  return profileCacheKey(a) === profileCacheKey(b);
}

export function mapCacheKey(profile: CompanyProfile, chips: RetrieveChips): string {
  const extra = [...(chips.extraGoeoKeys ?? [])].sort();
  return JSON.stringify({
    ...profileFields(profile),
    chips: {
      lane: chips.lane ?? "all",
      extraGoeoKeys: extra,
      includeDirectory: Boolean(chips.includeDirectory),
    },
  });
}

export function saveCachedMap(
  record: Omit<MapCacheRecord, "key">,
  store: MapStorage | null = browserStore(),
): void {
  if (!store) return;
  const cached: MapCacheRecord = {
    ...record,
    key: mapCacheKey(record.profile, record.chips),
  };
  store.setItem(MAP_CACHE_KEY, JSON.stringify(cached));
  store.setItem(MAP_PAYLOAD_KEY, JSON.stringify(record.payload));
}

export function peekCachedMap(
  store: MapStorage | null = browserStore(),
): MapCacheRecord | null {
  if (!store) return null;
  const raw = store.getItem(MAP_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MapCacheRecord;
  } catch {
    return null;
  }
}

export function loadCachedMap(
  profile: CompanyProfile,
  chips: RetrieveChips,
  store: MapStorage | null = browserStore(),
): MapCacheRecord | null {
  const cached = peekCachedMap(store);
  if (!cached) return null;
  if (cached.key !== mapCacheKey(profile, chips)) return null;
  return cached;
}

export function saveMapPayload(payload: OpportunityMapPayload): void {
  const store = browserStore();
  if (!store) return;
  store.setItem(MAP_PAYLOAD_KEY, JSON.stringify(payload));
}

export function loadMapPayload(): OpportunityMapPayload | null {
  const store = browserStore();
  if (!store) return null;
  const raw = store.getItem(MAP_PAYLOAD_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OpportunityMapPayload;
  } catch {
    return null;
  }
}

export function loadSavedSearch(
  store: MapStorage | null = localStore(),
): SavedSearch | null {
  if (!store) return null;
  const raw = store.getItem(SAVED_SEARCH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedSearch;
  } catch {
    return null;
  }
}

export function persistSavedSearch(
  search: SavedSearch,
  store: MapStorage | null = localStore(),
): void {
  if (!store) return;
  store.setItem(SAVED_SEARCH_KEY, JSON.stringify(search));
}
