import { describe, expect, it } from "vitest";
import { dropUnknownRankIds } from "./drop";
import type { RankModelCard } from "@/lib/types/opportunity";

function card(id: string): RankModelCard {
  return {
    id,
    fit: "adjacent",
    why: "test",
    concerns: [],
    nextStep: { label: "Open" },
  };
}

describe("dropUnknownRankIds", () => {
  it("drops rank ids that were not retrieved", () => {
    const kept = dropUnknownRankIds(
      [card("grants_gov:359666"), card("invented:grant"), card("curated:nucleus-grow")],
      ["grants_gov:359666", "curated:nucleus-grow"],
    );
    expect(kept.map((row) => row.id)).toEqual([
      "grants_gov:359666",
      "curated:nucleus-grow",
    ]);
  });

  it("drops a sam_opps id that was not retrieved", () => {
    const kept = dropUnknownRankIds(
      [card("sam_opps:abc123"), card("sam_opps:invented")],
      ["sam_opps:abc123"],
    );
    expect(kept.map((row) => row.id)).toEqual(["sam_opps:abc123"]);
  });
});

