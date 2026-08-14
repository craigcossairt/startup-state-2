import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { streamRetrieveThenRank } from "./pipeline";
import type { RankModelCard } from "@/lib/types/opportunity";

describe("streamRetrieveThenRank", () => {
  it("yields retrieve before rank so the map can paint before the Grok dump", async () => {
    const profile = loadCompanyFixture("fixture-1");
    const events: string[] = [];
    let retrievedIds: string[] = [];

    for await (const event of streamRetrieveThenRank(profile, {}, {
      rank: async (opportunities) => {
        events.push("rank-called");
        return opportunities.slice(0, 3).map(
          (row): RankModelCard => ({
            id: row.id,
            fit: row.lane === "state" ? "likely" : "potential-verify",
            why: "Canned fit for the stream test.",
            concerns: [],
            nextStep: { label: "Open the listing", url: row.url ?? undefined },
          }),
        );
      },
      history: async () => ({ sbirAwards: [], usaAwards: [] }),
    })) {
      events.push(event.type);
      if (event.type === "retrieved") {
        retrievedIds = event.retrievedIds;
        expect(events.includes("rank-called")).toBe(false);
        expect(event.retrievedIds.length).toBeGreaterThan(0);
      }
    }

    expect(events[0]).toBe("progress");
    expect(events).toContain("retrieved");
    expect(events).toContain("rank-called");
    expect(events).toContain("card");
    expect(events.at(-1)).toBe("done");
    expect(retrievedIds).toContain("curated:nucleus-grow");
  });
});
