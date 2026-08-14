import { describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { buildGrantsGovKeyword } from "./keyword";

describe("buildGrantsGovKeyword", () => {
  it("joins whatTheyDo, technologies, and sector labels for fixture-1", () => {
    const keyword = buildGrantsGovKeyword(loadCompanyFixture("fixture-1"));
    expect(keyword.toLowerCase()).toContain("nurses");
    expect(keyword.toLowerCase()).toContain("healthcare");
    expect(keyword.toLowerCase()).toContain("ai");
  });

  it("does not append Utah, city, or headcount", () => {
    const keyword = buildGrantsGovKeyword(loadCompanyFixture("fixture-1"));
    expect(keyword).not.toMatch(/utah/i);
    expect(keyword).not.toMatch(/salt lake/i);
    expect(keyword).not.toMatch(/\b15\b/);
  });

  it("stays at or under 200 characters on a long profile", () => {
    const profile = loadCompanyFixture("fixture-1");
    profile.whatTheyDo.value = `${"clinical workflow automation for hospital nursing teams ".repeat(8)}extra`;
    const keyword = buildGrantsGovKeyword(profile);
    expect(keyword.length).toBeLessThanOrEqual(200);
    expect(keyword.endsWith(" ")).toBe(false);
  });
});
