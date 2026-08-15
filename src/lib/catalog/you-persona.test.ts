import { describe, expect, it } from "vitest";
import { FIXTURE_CHIPS } from "@/lib/copy";
import { PLAYBOOK_STAGES } from "./playbook";
import {
  applyTestCase,
  EMPTY_YOU_PERSONA,
  FIXTURE_PERSONAS,
  orderPlaybookStages,
  paramsToPersona,
  personaIsFilled,
  personaToParams,
  parseStoredYouPersona,
  youSummaryChips,
} from "./you-persona";

describe("You persona", () => {
  it("maps Part 2 test cases onto leftover persona fields, not Part 1 demo people", () => {
    expect(FIXTURE_CHIPS.map((chip) => chip.id)).toEqual(Object.keys(FIXTURE_PERSONAS));
    expect(applyTestCase("fixture-1")).toEqual({
      stage: "Growing",
      sector: "Software",
      region: "Wasatch Front",
      communities: [],
      goal: "Find funding",
      revenue: "$1M-$10M",
      fixtureId: "fixture-1",
    });
    expect(applyTestCase("fixture-2").region).toBe("Northern Utah");
    expect(applyTestCase("fixture-2").sector).toBe("Manufacturing");
    expect(applyTestCase("fixture-5").sector).toBe("Marketplaces");
    expect(youSummaryChips(applyTestCase("fixture-1"))).toEqual([
      "Growing my business",
      "Software",
      "Wasatch Front",
      "Find funding",
      "$1M-$10M",
    ]);
  });

  it("round-trips URL params and rejects jordan as a fixture", () => {
    const persona = applyTestCase("fixture-1");
    const params = personaToParams(persona);
    expect(params.get("stage")).toBe("Growing");
    expect(params.get("fixture")).toBe("fixture-1");
    expect(paramsToPersona(params)).toEqual(persona);
    expect(personaIsFilled(params)).toBe(true);
    expect(personaIsFilled(new URLSearchParams())).toBe(false);
    expect(paramsToPersona(new URLSearchParams("fixture=jordan")).fixtureId).toBeNull();
    expect(parseStoredYouPersona(JSON.stringify(persona))).toEqual(persona);
    expect(parseStoredYouPersona("{")).toBeNull();
    expect(EMPTY_YOU_PERSONA.fixtureId).toBeNull();
  });

  it("keeps Thinking, Starting, Growing, Closing even when the persona is Growing", () => {
    const ordered = orderPlaybookStages(PLAYBOOK_STAGES, applyTestCase("fixture-1"));
    expect(ordered.map((stage) => stage.slug)).toEqual([
      "thinking-of-starting",
      "starting",
      "growing",
      "closing",
    ]);
  });
});
