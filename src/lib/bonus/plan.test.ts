import { describe, expect, it } from "vitest";
import { fundingPlan } from "./plan";
import { ranked } from "./test-cards";

describe("fundingPlan", () => {
  it("turns ranked cards into a four-week plan with checkable next steps", () => {
    const now = new Date("2026-08-14T00:00:00Z");
    const plan = fundingPlan(
      [
        ranked({
          id: "grants_gov:a",
          program: "NIH Seed",
          deadline: "2026-09-01",
          nextStep: { label: "Read the NIH listing", url: "https://grants.gov/a" },
        }),
        ranked({
          id: "grants_gov:b",
          program: "DOE Pilot",
          deadline: "2026-11-01",
          nextStep: { label: "Confirm DOE match" },
        }),
        ranked({
          id: "curated:sbdc",
          program: "Utah SBDC advising",
          status: "standing",
          deadline: null,
          nextStep: { label: "Book an SBDC advisor", url: "https://sbdc.utah.edu" },
        }),
      ],
      now,
    );
    expect(plan.map((week) => week.title)).toEqual([
      "This month",
      "Next 90 days",
      "Standing Utah help",
    ]);
    expect(plan[0].items[0]).toEqual({
      id: "grants_gov:a",
      label: "Read the NIH listing",
      program: "NIH Seed",
      url: "https://grants.gov/a",
      when: "2026-09-01",
    });
    expect(plan[2].items[0].id).toBe("curated:sbdc");
  });
});
