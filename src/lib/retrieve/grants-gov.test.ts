import { describe, expect, it } from "vitest";
import { searchGrantsGovLive } from "./grants-gov";

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
