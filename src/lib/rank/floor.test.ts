import { describe, expect, it } from "vitest";
import { FLOOR_BANNER } from "@/lib/copy";
import { applyProbablyNotFloor, tripProbablyNotFloor } from "./floor";
import type { Opportunity, RankedCard } from "@/lib/types/opportunity";

function card(id: string, lane: "federal" | "state", fit: RankedCard["fit"]): RankedCard {
  const opportunity: Opportunity = {
    id: id as Opportunity["id"],
    source: lane === "federal" ? "grants_gov" : "curated",
    nativeId: id.split(":")[1] ?? id,
    lane,
    jurisdiction: lane === "state" ? "UT" : null,
    instrument: "grant",
    status: "posted",
    program: id,
    agency: { name: "Agency" },
    value: null,
    deadline: null,
    url: null,
    aln: [],
    description: null,
  };
  return {
    opportunity,
    fit,
    why: "why",
    concerns: [],
    nextStep: { label: "Open" },
    similarAwardees: [],
  };
}

describe("tripProbablyNotFloor", () => {
  it("trips when there is no Federal likely or potential-verify and a Utah card is a real Fit", () => {
    expect(
      tripProbablyNotFloor([
        card("curated:sbdc", "state", "likely"),
        card("grants_gov:sbir", "federal", "probably_not"),
      ]),
    ).toBe(true);
  });

  it("does not trip when a Federal card is likely or potential-verify", () => {
    expect(
      tripProbablyNotFloor([
        card("grants_gov:nih", "federal", "potential-verify"),
        card("curated:nucleus-grow", "state", "likely"),
      ]),
    ).toBe(false);
  });

  it("does not trip when the only Utah cards are probably_not", () => {
    expect(
      tripProbablyNotFloor([
        card("curated:usbci", "state", "probably_not"),
        card("grants_gov:sbir", "federal", "probably_not"),
      ]),
    ).toBe(false);
  });
});

describe("applyProbablyNotFloor", () => {
  it("keeps Utah cards plus at most 3 Federal probably_not and the locked banner", () => {
    const applied = applyProbablyNotFloor([
      card("curated:sbdc", "state", "likely"),
      card("curated:usbci", "state", "adjacent"),
      card("grants_gov:1", "federal", "probably_not"),
      card("grants_gov:2", "federal", "probably_not"),
      card("grants_gov:3", "federal", "probably_not"),
      card("grants_gov:4", "federal", "probably_not"),
    ]);
    expect(applied.floorTripped).toBe(true);
    expect(applied.floorBanner).toBe(FLOOR_BANNER);
    expect(applied.cards.filter((row) => row.opportunity.lane === "federal")).toHaveLength(3);
    expect(applied.cards.some((row) => row.opportunity.id === "grants_gov:4")).toBe(false);
  });

  it("keeps Federal adjacent plus 3 Federal probably_not, Utah first, and drops the 4th probably_not", () => {
    const applied = applyProbablyNotFloor([
      card("curated:sbdc", "state", "likely"),
      card("grants_gov:adjacent", "federal", "adjacent"),
      card("grants_gov:1", "federal", "probably_not"),
      card("grants_gov:2", "federal", "probably_not"),
      card("grants_gov:3", "federal", "probably_not"),
      card("grants_gov:4", "federal", "probably_not"),
    ]);
    expect(applied.floorTripped).toBe(true);
    expect(applied.floorBanner).toBe(FLOOR_BANNER);
    expect(applied.cards[0]?.opportunity.id).toBe("curated:sbdc");
    expect(applied.cards.map((row) => row.opportunity.id)).toEqual([
      "curated:sbdc",
      "grants_gov:adjacent",
      "grants_gov:1",
      "grants_gov:2",
      "grants_gov:3",
    ]);
    expect(applied.cards.some((row) => row.opportunity.id === "grants_gov:4")).toBe(false);
  });
});
