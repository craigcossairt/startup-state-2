import { describe, expect, it } from "vitest";
import { emptyCompanyProfile } from "./empty";
import { seedLocationDefaults } from "./must-haves";
import { DEFAULT_HQ_COUNTRY, DEFAULT_HQ_STATE } from "@/lib/labels";

describe("seedLocationDefaults", () => {
  it("drafts United States and Utah when country and state are still missing", () => {
    const seeded = seedLocationDefaults(emptyCompanyProfile());
    expect(seeded.hqCountry.status).toBe("missing");
    expect(seeded.hqCountry.value).toBe(DEFAULT_HQ_COUNTRY);
    expect(seeded.hqState.status).toBe("missing");
    expect(seeded.hqState.value).toBe(DEFAULT_HQ_STATE);
  });

  it("does not overwrite a known or inferred location", () => {
    const profile = emptyCompanyProfile();
    profile.hqCountry = { status: "inferred", value: "CA", confidence: 0.6 };
    profile.hqState = { status: "known", value: "CO" };
    const seeded = seedLocationDefaults(profile);
    expect(seeded.hqCountry.value).toBe("CA");
    expect(seeded.hqState.value).toBe("CO");
  });
});
