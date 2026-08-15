import { describe, expect, it } from "vitest";
import { FLOOR_BANNER, PADDED_CARD_WHY } from "@/lib/copy";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { retrieveOpportunities } from "@/lib/retrieve/retrieve";
import { assembleRankedCards } from "./assemble";
import type { Opportunity, RankModelCard } from "@/lib/types/opportunity";

function listing(
  id: Opportunity["id"],
  lane: Opportunity["lane"],
  url: string | null = `https://example.test/${id}`,
): Opportunity {
  return {
    id,
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
    url,
    aln: [],
    description: null,
  };
}

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

    expect(payload.cards.map((card) => String(card.opportunity.id))).toEqual(
      expect.arrayContaining([federal.id, nucleus.id]),
    );
    expect(payload.cards.map((card) => String(card.opportunity.id))).not.toContain(
      "invented:grant",
    );
    expect(payload.cards.length).toBeGreaterThanOrEqual(2);
    expect(payload.cards.length).toBeLessThanOrEqual(12);
    expect(payload.cards[0].opportunity.program).toBe(federal.program);
    expect(payload.cards[0].opportunity.agency).toEqual(federal.agency);
    expect(payload.cards[0].opportunity.value).toEqual(federal.value);
    expect(payload.cards[0].opportunity.deadline).toBe(federal.deadline);
    expect(payload.cards[0].opportunity.url).toBe(federal.url);
    expect(payload.cards[0].opportunity.lane).toBe("federal");
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

  it("prefers the retrieve listing url over the model next-step url", () => {
    const retrieved = listing("grants_gov:1", "federal", "https://www.grants.gov/search-results-detail/1");
    const payload = assembleRankedCards([retrieved], [
      {
        id: retrieved.id,
        fit: "likely",
        why: "Sector overlap.",
        concerns: ["Verify the official listing."],
        nextStep: { label: "Open the listing", url: "https://model.example/made-up" },
      },
    ]);
    expect(payload.cards[0]?.nextStep.url).toBe(retrieved.url);
  });

  it("pads a second Utah card from retrieve when GOEO keys fired", () => {
    const utah1 = listing("curated:sbdc", "state");
    const utah2 = listing("curated:nucleus-grow", "state");
    const federal = ["1", "2", "3"].map((id) => listing(`grants_gov:${id}`, "federal"));
    const payload = assembleRankedCards(
      [utah1, utah2, ...federal],
      [rank(utah1.id, "likely"), ...federal.map((row) => rank(row.id, "likely"))],
      ["counseling"],
    );
    const utahIds = payload.cards
      .filter((card) => card.opportunity.lane === "state")
      .map((card) => card.opportunity.id);
    expect(utahIds).toEqual(expect.arrayContaining([utah1.id, utah2.id]));
    expect(utahIds.length).toBeGreaterThanOrEqual(2);
    expect(payload.cards.every((card) =>
      [utah1.id, utah2.id, ...federal.map((row) => row.id)].includes(card.opportunity.id),
    )).toBe(true);
    const padded = payload.cards.find((card) => card.opportunity.id === utah2.id);
    expect(padded?.fit).toBe("adjacent");
    expect(padded?.why).toBe(PADDED_CARD_WHY);
  });

  it("clamps a 20-id rank list to 12 and still keeps two Utah cards", () => {
    const utah = ["a", "b", "c", "d"].map((id) => listing(`curated:${id}`, "state"));
    const federal = Array.from({ length: 16 }, (_, i) =>
      listing(`grants_gov:${i}`, "federal"),
    );
    const retrieved = [...utah, ...federal];
    const payload = assembleRankedCards(
      retrieved,
      [
        ...federal.map((row) => rank(row.id, "likely")),
        ...utah.map((row) => rank(row.id, "probably_not")),
      ],
      ["sbir-help"],
    );
    expect(payload.cards.length).toBeLessThanOrEqual(12);
    expect(
      payload.cards.filter((card) => card.opportunity.lane === "state").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      payload.cards.every((card) => retrieved.some((row) => row.id === card.opportunity.id)),
    ).toBe(true);
  });

  it("keeps Federal probably_not under a tripped floor when many Utah cards would overflow 12", () => {
    const utah = Array.from({ length: 14 }, (_, i) =>
      listing(`curated:u${i}`, "state"),
    );
    const federal = ["1", "2"].map((id) => listing(`grants_gov:${id}`, "federal"));
    const payload = assembleRankedCards(
      [...utah, ...federal],
      [
        ...utah.map((row) => rank(row.id, "likely")),
        ...federal.map((row) => rank(row.id, "probably_not")),
      ],
      ["counseling"],
    );
    expect(payload.floorTripped).toBe(true);
    expect(payload.cards).toHaveLength(12);
    expect(payload.cards[0]?.opportunity.lane).toBe("state");
    expect(
      payload.cards.filter((card) => card.opportunity.lane === "federal"),
    ).toHaveLength(2);
    expect(
      payload.cards
        .filter((card) => card.opportunity.lane === "federal")
        .every((card) => card.fit === "probably_not"),
    ).toBe(true);
  });

  it("pads unused retrieve rows up to 8 when the model returns a short list", () => {
    const utah = ["sbdc", "nucleus-grow"].map((id) => listing(`curated:${id}`, "state"));
    const federal = Array.from({ length: 10 }, (_, i) =>
      listing(`grants_gov:${i}`, "federal"),
    );
    const retrieved = [...utah, ...federal];
    const payload = assembleRankedCards(
      retrieved,
      [rank(utah[0].id, "likely"), rank(federal[0].id, "likely"), rank(federal[1].id, "likely")],
      ["workforce"],
    );
    expect(payload.cards).toHaveLength(8);
    expect(
      payload.cards.filter((card) => card.opportunity.lane === "state").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      payload.cards.every((card) => retrieved.some((row) => row.id === card.opportunity.id)),
    ).toBe(true);
  });
});
