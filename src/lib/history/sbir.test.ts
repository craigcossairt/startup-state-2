import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dataPath } from "@/lib/paths";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { historyTokens, loadSbirAwards } from "./sbir";

describe("loadSbirAwards", () => {
  it("returns named Utah SBIR firms for fixture-1 from committed cache", async () => {
    expect(existsSync(dataPath("cache", "sbir", "utah-awards.json"))).toBe(true);
    const awards = await loadSbirAwards(loadCompanyFixture("fixture-1"));
    expect(awards.length).toBeGreaterThan(0);
    expect(awards.every((row) => row.source === "sbir_csv")).toBe(true);
    expect(awards.every((row) => row.state === "UT")).toBe(true);
    expect(awards.every((row) => row.name.length > 0)).toBe(true);
  });

  it("keeps two-letter tokens such as ai from fixture-1", () => {
    expect(historyTokens(loadCompanyFixture("fixture-1"))).toContain("ai");
  });

  it("keeps the two-letter token ai and still returns named Utah rows from committed cache", async () => {
    const profile = {
      ...loadCompanyFixture("fixture-1"),
      technologies: { status: "known" as const, value: ["ai"] },
      sectors: { status: "known" as const, value: [] },
    };
    const awards = await loadSbirAwards(profile);
    expect(awards.length).toBeGreaterThan(0);
    expect(awards.every((row) => row.source === "sbir_csv")).toBe(true);
    expect(awards.every((row) => row.state === "UT")).toBe(true);
    expect(awards.every((row) => row.name.length > 0)).toBe(true);
    expect(
      awards.every((row) =>
        `${row.summary ?? ""} ${row.name}`.toLowerCase().includes("ai"),
      ),
    ).toBe(true);
  });

  it("returns no rows when no token matches, instead of the first Utah awards", async () => {
    const profile = {
      ...loadCompanyFixture("fixture-1"),
      technologies: { status: "known" as const, value: ["zzzxnotarealtoken"] },
      sectors: { status: "known" as const, value: [] },
    };
    expect(await loadSbirAwards(profile)).toEqual([]);
  });
});
