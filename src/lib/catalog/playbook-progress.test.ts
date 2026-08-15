import { describe, expect, it } from "vitest";
import {
  applySetDone,
  applyVisit,
  completedInStage,
  emptyPlaybookProgress,
  parsePlaybookProgress,
  playbookStepKey,
} from "./playbook-progress";

describe("playbook progress", () => {
  it("marks a second step done without dropping the first", () => {
    const first = applySetDone(emptyPlaybookProgress(), "starting", "business-validation", true);
    const both = applySetDone(first, "starting", "fund-small-business", true);
    expect(playbookStepKey("starting", "business-validation")).toBe("starting/business-validation");
    expect(both.completedStepIds).toEqual([
      "starting/business-validation",
      "starting/fund-small-business",
    ]);
    expect(completedInStage(both, "starting")).toBe(2);
    expect(completedInStage(both, "growing")).toBe(0);
  });

  it("parses stored progress and records the last visited step", () => {
    const stored = parsePlaybookProgress(
      JSON.stringify({
        completedStepIds: ["starting/business-validation", 12],
        lastVisitedStepId: "starting/business-validation",
        lastUpdated: 99,
      }),
    );
    expect(stored.completedStepIds).toEqual(["starting/business-validation"]);
    expect(stored.lastVisitedStepId).toBe("starting/business-validation");
    const visited = applyVisit(stored, "growing", "workforce");
    expect(visited.lastVisitedStepId).toBe("growing/workforce");
    expect(visited.completedStepIds).toEqual(["starting/business-validation"]);
    expect(parsePlaybookProgress(null).completedStepIds).toEqual([]);
    expect(parsePlaybookProgress("{").completedStepIds).toEqual([]);
  });
});
