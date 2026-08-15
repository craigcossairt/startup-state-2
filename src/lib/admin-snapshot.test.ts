import { describe, expect, it } from "vitest";
import { buildAdminSnapshot } from "./admin-snapshot";
import { loadAdminOperations } from "./admin-operations";

describe("GOED admin snapshot", () => {
  it("still names catalog counts for leftover inventory", () => {
    expect(
      buildAdminSnapshot({ resources: 213, startups: 220, playbookSteps: 19 }),
    ).toEqual({
      resources: 213,
      startups: 220,
      playbookSteps: 19,
      queues: {
        pendingListings: "not-persisted",
        claims: "not-persisted",
        leftoverWatches: "device-only",
      },
    });
  });

  it("fills the Part 1 queues from the committed operations fixture", () => {
    const ops = loadAdminOperations();
    expect(ops.pending).toHaveLength(1);
    expect(ops.claims).toHaveLength(2);
    expect(ops.outreach).toHaveLength(3);
    expect(ops.auditTotal).toBeGreaterThan(20);
  });
});
