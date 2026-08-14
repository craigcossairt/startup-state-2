import { describe, expect, it } from "vitest";
import { FLOOR_BANNER } from "@/lib/copy";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { retrieveOpportunities } from "@/lib/retrieve/retrieve";
import { assembleRankedCards } from "./assemble";
import type { RankModelCard } from "@/lib/types/opportunity";

function rank(
  id: string,
  fit: RankModelCard["fit"],
  why = "Sector and stage overlap.",
): RankModelCard {
  return {
    id,
    fit,
    why,
    concerns: ["Verify the official listing."],
    nextStep: { label: "Open the listing" },
  };
}

describe("assembleRankedCards", () => {
  it("drops unknown rank ids and copies listing fields from retrieve", async () => {
    const retrieved = await retrieveOpportunities(loadCompanyFixture("fixture-1"));
    const federal = retrieved.opportunities.find((row) => row.source === "grants_gov");
    const nucleus = retrieved.opportunities.find((row) => row.id === "curated:nucleus-grow");
    expect(federal && nucleus).toBeTruthy();
    if (!federal || !nucleus) return;

    const payload = assembleRankedCards(retrieved.opportunities, [
      rank(federal.id, "likely"),
      rank("invented:grant", "likely"),
      rank(nucleus.id, "potential-verify"),
    ]);

    expect(payload.cards.map((card) => card.opportunity.id)).toEqual([
      federal.id,
      nucleus.id,
    ]);
    expect(payload.cards[0].opportunity.program).toBe(federal.program);
    expect(payload.cards[0].opportunity.agency).toEqual(federal.agency);
    expect(payload.cards[0].opportunity.value).toEqual(federal.value);
    expect(payload.cards[0].opportunity.deadline).toBe(federal.deadline);
    expect(payload.cards[0].opportunity.url).toBe(federal.url);
    expect(payload.cards[0].opportunity.lane).toBe("federal");
    expect(payload.cards.map((card) => String(card.opportunity.id))).not.toContain(
      "invented:grant",
    );
  });

  it("trips the fixture-5 floor from canned rank input without inventing a federal grant", async () => {
    const retrieved = await retrieveOpportunities(loadCompanyFixture("fixture-5"));
    const utah = retrieved.opportunities.filter((row) => row.lane === "state").slice(0, 4);
    const federal = retrieved.opportunities.filter((row) => row.lane === "federal").slice(0, 2);
    expect(utah.length).toBeGreaterThan(0);
    expect(federal.length).toBeGreaterThan(0);

    const payload = assembleRankedCards(retrieved.opportunities, [
      ...utah.map((row) => rank(row.id, "likely", "Utah counseling and workforce programs fit this marketplace.")),
      ...federal.map((row) =>
        rank(row.id, "probably_not", "A parent/youth marketplace is not an SBIR research program."),
      ),
    ]);

    expect(payload.floorTripped).toBe(true);
    expect(payload.floorBanner).toBe(FLOOR_BANNER);
    expect(payload.cards[0].opportunity.lane).toBe("state");
    expect(
      payload.cards.filter((card) => card.opportunity.lane === "federal").every(
        (card) => card.fit === "probably_not",
      ),
    ).toBe(true);
    expect(payload.cards.every((card) => retrieved.retrievedIds.includes(card.opportunity.id))).toBe(true);
  });
});
