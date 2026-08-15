import { describe, expect, it } from "vitest";
import { emptyCompanyProfile } from "@/lib/profile/empty";
import {
  describeSearch,
  newOpportunityIds,
  subscribeToSearch,
} from "./alerts";
import type { CompanyProfile } from "@/lib/types/company-profile";

function profile(): CompanyProfile {
  return {
    ...emptyCompanyProfile(),
    fixtureId: "fixture-1",
    whatTheyDo: { status: "known", value: "AI healthcare SaaS" },
  };
}

describe("saved search alerts", () => {
  it("subscribes to the current company search, not individual listing watches", () => {
    const search = subscribeToSearch({
      profile: profile(),
      chips: { lane: "federal" },
      seenIds: ["grants_gov:359671", "curated:nucleus-grow"],
    });
    expect(search.seenIds).toEqual(["grants_gov:359671", "curated:nucleus-grow"]);
    expect(search.chips).toEqual({ lane: "federal" });
    expect(search.label).toBe("Healthcare AI");
  });

  it("flags retrieved ids that were not on the map when the search was saved", () => {
    expect(
      newOpportunityIds(
        ["grants_gov:359671", "curated:nucleus-grow"],
        ["grants_gov:359671", "grants_gov:new", "curated:nucleus-grow"],
      ),
    ).toEqual(["grants_gov:new"]);
  });

  it("names the search from the company, not a listing deadline", () => {
    expect(describeSearch(profile(), {})).toBe("Healthcare AI");
  });
});
