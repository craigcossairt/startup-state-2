import { describe, expect, it } from "vitest";
import { pendingCardsFromPreviews } from "@/lib/map-metrics";

describe("pendingCardsFromPreviews", () => {
  it("turns retrieved previews into cards the map can paint before rank finishes", () => {
    const cards = pendingCardsFromPreviews([
      {
        id: "grants_gov:359671",
        program: "Parent SBIR",
        lane: "federal",
        agency: "HHS",
      },
      {
        id: "curated:nucleus-grow",
        program: "Nucleus Grow",
        lane: "state",
        agency: "Nucleus",
      },
    ]);
    expect(cards).toHaveLength(2);
    expect(cards[0]?.ranking).toBe(true);
    expect(cards[0]?.opportunity.program).toBe("Parent SBIR");
    expect(cards[0]?.opportunity.lane).toBe("federal");
    expect(cards[1]?.opportunity.program).toBe("Nucleus Grow");
  });
});
