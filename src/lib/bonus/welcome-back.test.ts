import { describe, expect, it } from "vitest";
import { emptyCompanyProfile } from "@/lib/profile/empty";
import { PROFILE_STORAGE_KEY } from "@/lib/session-profile";
import { restoreLastCompanyProfile } from "./welcome-back";

describe("restoreLastCompanyProfile", () => {
  it("restores the last Company profile from session storage", () => {
    const stored = {
      ...emptyCompanyProfile(),
      whatTheyDo: { status: "known" as const, value: "AI healthcare SaaS" },
      hqState: { status: "known" as const, value: "UT" },
    };
    const storage = {
      getItem(key: string) {
        return key === PROFILE_STORAGE_KEY ? JSON.stringify(stored) : null;
      },
    };
    const restored = restoreLastCompanyProfile(storage);
    expect(restored?.whatTheyDo.value).toBe("AI healthcare SaaS");
    expect(restored?.hqState.value).toBe("UT");
  });

  it("returns null when no session profile exists", () => {
    expect(restoreLastCompanyProfile({ getItem: () => null })).toBeNull();
  });
});
