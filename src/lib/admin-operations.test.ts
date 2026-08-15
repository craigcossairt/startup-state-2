import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { filterStartupsForList, loadAdminOperations } from "./admin-operations";
import { parseStartupList } from "./catalog/parse";

describe("Part 1 admin operations", () => {
  it("loads Bloom pending, two claims, and three outreach lists", () => {
    const ops = loadAdminOperations();
    expect(ops.pending.map((row) => row.name)).toEqual(["Bloom"]);
    expect(ops.pending[0]?.website).toContain("bloom.date");
    expect(ops.pending[0]?.sector).toBe("Software");
    expect(ops.pending[0]?.city).toBe("South Jordan");
    expect(ops.claims.map((row) => row.startupName)).toEqual([
      "JobNimbus",
      "alphaMountain",
    ]);
    expect(ops.claims[0]?.requesterEmail).toBe("test@jobnimbus.com");
    expect(ops.claims[1]?.requesterEmail).toBe("founder@alphamountain.ai");
    expect(ops.outreach.map((row) => row.slug)).toEqual([
      "utah-software-leaders",
      "wasatch-front-hiring",
      "utah-deep-tech",
    ]);
    expect(ops.savedTotal).toBe(0);
    expect(ops.auditTotal).toBeGreaterThan(0);
    expect(ops.sections.map((row) => [row.id, row.label])).toEqual([
      ["pending", "Pending submissions"],
      ["claims", "Claim queue"],
      ["outreach", "Outreach lists"],
      ["saved-searches", "Saved-search subscribers"],
      ["audit", "Audit log"],
    ]);
  });

  it("filters catalog startups for each outreach list", () => {
    const startups = parseStartupList(
      JSON.parse(
        readFileSync(path.join(process.cwd(), "data/catalog/startups.json"), "utf8"),
      ),
    );
    const ops = loadAdminOperations();
    const software = filterStartupsForList(startups, ops.outreach[0]!.filter);
    const hiring = filterStartupsForList(startups, ops.outreach[1]!.filter);
    const deepTech = filterStartupsForList(startups, ops.outreach[2]!.filter);
    expect(software.length).toBeGreaterThan(10);
    expect(software.every((row) => row.sector === "Software")).toBe(true);
    expect(hiring.length).toBeGreaterThan(10);
    expect(hiring.every((row) => row.region === "Wasatch Front")).toBe(true);
    expect(deepTech.every((row) => ["BioMedical", "Security", "Energy"].includes(row.sector))).toBe(
      true,
    );
  });
});
