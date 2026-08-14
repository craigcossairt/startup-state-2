import { describe, expect, it } from "vitest";
import { emptyCompanyProfile } from "./empty";
import {
  applyMustHaveDraft,
  confirmInferredMustHaves,
  inferredMustHaves,
  missingMustHaves,
  promoteFilledMustHaves,
} from "./must-haves";

describe("applyMustHaveDraft", () => {
  it("keeps a missing whatTheyDo on the Ask list after the first character", () => {
    let profile = emptyCompanyProfile();
    expect(missingMustHaves(profile)).toContain("whatTheyDo");

    profile = applyMustHaveDraft(profile, "whatTheyDo", "A");
    expect(profile.whatTheyDo.status).toBe("missing");
    expect(profile.whatTheyDo.value).toBe("A");
    expect(missingMustHaves(profile)).toContain("whatTheyDo");

    profile = applyMustHaveDraft(profile, "whatTheyDo", "AI");
    expect(profile.whatTheyDo.value).toBe("AI");
    expect(missingMustHaves(profile)).toContain("whatTheyDo");
  });

  it("keeps an inferred must-have inferred so Confirm can edit before Continue", () => {
    const profile = applyMustHaveDraft(
      {
        ...emptyCompanyProfile(),
        whatTheyDo: { status: "inferred", value: "nursing SaaS", confidence: 0.7 },
      },
      "whatTheyDo",
      "AI tools for nurses",
    );
    expect(profile.whatTheyDo.status).toBe("inferred");
    expect(profile.whatTheyDo.value).toBe("AI tools for nurses");
    expect(inferredMustHaves(profile)).toContain("whatTheyDo");

    const confirmed = confirmInferredMustHaves(profile);
    expect(confirmed.whatTheyDo.status).toBe("known");
    expect(confirmed.whatTheyDo.value).toBe("AI tools for nurses");
  });
});

describe("promoteFilledMustHaves", () => {
  it("marks drafted missing fields known only when they have a value", () => {
    const drafted = applyMustHaveDraft(emptyCompanyProfile(), "whatTheyDo", "AI");
    const promoted = promoteFilledMustHaves(drafted);
    expect(promoted.whatTheyDo.status).toBe("known");
    expect(promoted.hqState.status).toBe("missing");
  });
});
