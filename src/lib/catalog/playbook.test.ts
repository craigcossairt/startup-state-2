import { describe, expect, it } from "vitest";
import {
  PLAYBOOK_STAGES,
  PLAYBOOK_STEPS,
  adjacentPlaybookSteps,
  playbookStep,
  stepCountByStage,
  stepsForStage,
} from "./playbook";

describe("Utah playbook catalog", () => {
  it("locks 19 official steps across four stages", () => {
    expect(PLAYBOOK_STAGES.map((stage) => stage.slug)).toEqual([
      "thinking-of-starting",
      "starting",
      "growing",
      "closing",
    ]);
    expect(PLAYBOOK_STEPS).toHaveLength(19);
    expect(stepCountByStage()).toEqual({
      "thinking-of-starting": 2,
      starting: 9,
      growing: 7,
      closing: 1,
    });
    expect(stepsForStage("starting")[0]?.stepId).toBe("business-validation");
    expect(playbookStep("growing", "workforce")?.title).toBe(
      "Workforce and talent acquisition",
    );
    expect(adjacentPlaybookSteps("starting", "business-validation")).toEqual({
      prev: null,
      next: {
        stepId: "build-product",
        title: "Build your product or service",
      },
    });
    expect(adjacentPlaybookSteps("closing", "close-business").prev).toBeNull();
    expect(adjacentPlaybookSteps("closing", "close-business").next).toBeNull();
  });

  it("points every step at the official startup.utah.gov page", () => {
    for (const step of PLAYBOOK_STEPS) {
      expect(step.sourceUrl).toMatch(/^https:\/\/startup\.utah\.gov\//);
      expect(step.summary.length).toBeGreaterThan(20);
      expect(step.whatYouDo.length).toBeGreaterThanOrEqual(3);
      expect(`${step.summary}\n${step.whatYouDo.join("\n")}`).not.toMatch(/—/);
    }
  });
});
