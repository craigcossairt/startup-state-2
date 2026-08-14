import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dataPath } from "@/lib/paths";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { loadSbirAwards } from "./sbir";

describe("loadSbirAwards", () => {
  it("returns named Utah SBIR firms for fixture-1 from committed cache", async () => {
    expect(existsSync(dataPath("cache", "sbir", "utah-awards.json"))).toBe(true);
    const awards = await loadSbirAwards(loadCompanyFixture("fixture-1"));
    expect(awards.length).toBeGreaterThan(0);
    expect(awards.every((row) => row.source === "sbir_csv")).toBe(true);
    expect(awards.every((row) => row.state === "UT")).toBe(true);
    expect(awards.every((row) => row.name.length > 0)).toBe(true);
  });
});
