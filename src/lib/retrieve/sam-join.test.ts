import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dataPath } from "@/lib/paths";
import type { Opportunity } from "@/lib/types/opportunity";
import { joinSamListings } from "./sam-join";

function grant(aln: string[]): Opportunity {
  return {
    id: "grants_gov:359666",
    source: "grants_gov",
    nativeId: "359666",
    lane: "federal",
    jurisdiction: null,
    instrument: "grant",
    status: "posted",
    program: "Test grant",
    agency: { name: "NIH" },
    value: null,
    deadline: null,
    url: null,
    aln,
    description: null,
  };
}

describe("joinSamListings", () => {
  it("fills a Grants.gov description from the committed SAM slice", () => {
    expect(existsSync(dataPath("cache", "sam", "listings-slice.json"))).toBe(true);
    const [joined] = joinSamListings([grant(["93.865"])]);
    expect(joined.description).toMatch(/Child Health and Human Development/i);
  });
});
