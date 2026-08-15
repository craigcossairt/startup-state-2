import { describe, expect, it } from "vitest";
import { applyTestCase } from "./you-persona";
import { PLAYBOOK_STEPS } from "./playbook";
import { fallbackRoadmap, personaHash, parseRoadmap } from "./roadmap";

describe("playbook roadmap", () => {
  it("builds a four-week Growing plan from locked playbook steps", () => {
    const persona = applyTestCase("fixture-1");
    const roadmap = fallbackRoadmap(persona);
    expect(roadmap.plan).toHaveLength(4);
    expect(roadmap.plan.map((week) => week.week)).toEqual([1, 2, 3, 4]);
    const actions = roadmap.plan.flatMap((week) => week.actions);
    expect(actions.length).toBeGreaterThanOrEqual(8);
    expect(actions.length).toBeLessThanOrEqual(12);
    const hrefs = actions.map((action) => action.href).filter(Boolean);
    expect(hrefs.length).toBeGreaterThan(0);
    const known = new Set(
      PLAYBOOK_STEPS.map((step) => `/playbook/${step.stage}/${step.stepId}`),
    );
    expect(hrefs.every((href) => known.has(href!))).toBe(true);
    expect(roadmap.summary).toMatch(/Software|funding|Wasatch/i);
    expect(JSON.stringify(roadmap)).not.toMatch(/\bGOEO\b/);
    expect(personaHash(persona)).toMatch(/^[a-f0-9]{16}$/);
  });

  it("rejects a plan that is not four weeks", () => {
    expect(
      parseRoadmap({
        summary: "Nope",
        plan: [{ week: 1, focus: "Only one", actions: [{ text: "Do a thing" }] }],
      }),
    ).toBeNull();
  });

  it("turns em dashes in generated copy into hyphens", () => {
    const parsed = parseRoadmap({
      summary: "A month for Software — Wasatch Front.",
      plan: [1, 2, 3, 4].map((week) => ({
        week,
        focus: "Fund the round — then hire",
        actions: [
          { text: "Call SBDC — then file", rationale: "Speed — not theater" },
          { text: "Open the Opportunity Map" },
        ],
      })),
    });
    expect(parsed?.summary).toBe("A month for Software - Wasatch Front.");
    expect(parsed?.plan[0]?.focus).toBe("Fund the round - then hire");
    expect(parsed?.plan[0]?.actions[0]).toEqual({
      text: "Call SBDC - then file",
      rationale: "Speed - not theater",
    });
  });
});
