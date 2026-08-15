import { describe, expect, it } from "vitest";
import { emptyCompanyProfile } from "@/lib/profile/empty";
import { ranked } from "@/lib/bonus/test-cards";
import { subscribeToSearch } from "@/lib/bonus/alerts";
import {
  isSameCompanySearch,
  loadCachedMap,
  loadSavedSearch,
  mapCacheKey,
  peekCachedMap,
  persistSavedSearch,
  saveCachedMap,
  type MapStorage,
} from "./session-map";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type { OpportunityMapPayload, RetrieveChips } from "@/lib/types/opportunity";

function memoryStore(initial: Record<string, string> = {}): MapStorage {
  const data = { ...initial };
  return {
    getItem(key) {
      return data[key] ?? null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

function profile(whatTheyDo: string): CompanyProfile {
  return {
    ...emptyCompanyProfile(),
    fixtureId: "fixture-1",
    whatTheyDo: { status: "known", value: whatTheyDo },
  };
}

function payload(ids: string[]): OpportunityMapPayload {
  return {
    cards: ids.map((id) => ranked({ id })),
    floorTripped: false,
    floorBanner: null,
    retrievedIds: ids,
    firedKeys: ["sbir-help"],
  };
}

describe("map cache", () => {
  it("restores a ranked map when the company profile and retrieve chips match", () => {
    const store = memoryStore();
    const company = profile("AI healthcare SaaS");
    const chips: RetrieveChips = { lane: "federal" };
    const rankedMap = payload(["grants_gov:359671", "curated:nucleus-grow"]);
    saveCachedMap({ profile: company, chips, payload: rankedMap }, store);

    const hit = loadCachedMap(company, chips, store);
    expect(hit?.payload.retrievedIds).toEqual([
      "grants_gov:359671",
      "curated:nucleus-grow",
    ]);
    expect(hit?.payload.cards[0]?.opportunity.program).toBe("grants_gov:359671");
  });

  it("does not restore when retrieve chips change", () => {
    const store = memoryStore();
    const company = profile("AI healthcare SaaS");
    saveCachedMap(
      { profile: company, chips: { lane: "federal" }, payload: payload(["grants_gov:1"]) },
      store,
    );
    expect(loadCachedMap(company, { lane: "state" }, store)).toBeNull();
    expect(loadCachedMap(company, { includeDirectory: true }, store)).toBeNull();
  });

  it("does not restore when the company profile used for retrieve changes", () => {
    const store = memoryStore();
    saveCachedMap(
      {
        profile: profile("AI healthcare SaaS"),
        chips: {},
        payload: payload(["grants_gov:1"]),
      },
      store,
    );
    expect(loadCachedMap(profile("Youth marketplace"), {}, store)).toBeNull();
  });

  it("uses the same key for identical profile plus chips", () => {
    const company = profile("AI healthcare SaaS");
    expect(mapCacheKey(company, { extraGoeoKeys: ["trade", "workforce"] })).toBe(
      mapCacheKey(company, { extraGoeoKeys: ["workforce", "trade"] }),
    );
  });

  it("keeps the last cache readable when current chips would miss", () => {
    const store = memoryStore();
    const company = profile("AI healthcare SaaS");
    saveCachedMap(
      { profile: company, chips: { lane: "federal" }, payload: payload(["grants_gov:1"]) },
      store,
    );
    expect(loadCachedMap(company, {}, store)).toBeNull();
    expect(peekCachedMap(store)?.chips).toEqual({ lane: "federal" });
  });

  it("treats two profiles as the same search only when must-haves match", () => {
    expect(isSameCompanySearch(profile("AI healthcare SaaS"), profile("AI healthcare SaaS"))).toBe(
      true,
    );
    expect(isSameCompanySearch(profile("AI healthcare SaaS"), profile("Youth marketplace"))).toBe(
      false,
    );
  });

  it("persists a watched search on the store the caller passes", () => {
    const store = memoryStore();
    const company = profile("AI healthcare SaaS");
    persistSavedSearch(
      subscribeToSearch({
        profile: company,
        chips: { lane: "federal" },
        seenIds: ["grants_gov:1"],
      }),
      store,
    );
    expect(loadSavedSearch(store)?.seenIds).toEqual(["grants_gov:1"]);
    expect(loadSavedSearch(memoryStore())).toBeNull();
  });
});
