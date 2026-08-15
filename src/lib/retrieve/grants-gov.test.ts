import { describe, expect, it } from "vitest";
import { dropDiplomaticMissionGrants, searchGrantsGovLive } from "./grants-gov";
import type { Opportunity } from "@/lib/types/opportunity";

function hit(id: string, agency: string, program: string): Opportunity {
  return {
    id: `grants_gov:${id}`,
    source: "grants_gov",
    nativeId: id,
    lane: "federal",
    jurisdiction: null,
    instrument: "grant",
    status: "posted",
    program,
    agency: { name: agency },
    value: null,
    deadline: null,
    url: null,
    aln: [],
    description: null,
  };
}

describe("searchGrantsGovLive", () => {
  it("posts keyword and status only, without an eligibility filter", async () => {
    const bodies: Record<string, unknown>[] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return {
        ok: true,
        json: async () => ({ data: { oppHits: [] } }),
      } as Response;
    };

    await searchGrantsGovLive("aerospace manufacturing", fetchImpl);

    expect(bodies).toHaveLength(2);
    for (const body of bodies) {
      expect(body).toMatchObject({
        rows: 25,
        oppStatuses: "forecasted|posted",
      });
      expect(body).not.toHaveProperty("eligibilities");
    }
    expect(bodies[0]?.keyword).toBe("aerospace manufacturing");
    expect(String(bodies[1]?.keyword)).toMatch(/^SBIR /);
  });
});

describe("dropDiplomaticMissionGrants", () => {
  it("keeps NIH and drops a U.S. Mission listing", () => {
    const kept = dropDiplomaticMissionGrants([
      hit("359666", "National Institutes of Health", "PRIMED-AI Model-to-Clinic"),
      hit("363320", "U.S. Mission to Argentina", "U.S.-Argentina Alumni Summit"),
    ]);
    expect(kept.map((row) => row.nativeId)).toEqual(["359666"]);
  });
});
