import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  leftoverFixtureHref,
  leftoverFixtureNeedles,
  parseLeftoverFixtureId,
  rankResourcesForNeedles,
  withLeftoverFixture,
} from "./leftover-test-case";
import { FIXTURE_CHIPS } from "@/lib/copy";
import { loadCompanyFixture, FIXTURE_IDS } from "@/lib/profile/load-fixture";
import type { CatalogResource } from "./types";

describe("leftover test cases", () => {
  it("uses the five Part 2 fixtures, not Part 1 demo people", () => {
    expect(FIXTURE_CHIPS.map((chip) => chip.id)).toEqual(FIXTURE_IDS);
    expect(parseLeftoverFixtureId("fixture-3")).toBe("fixture-3");
    expect(parseLeftoverFixtureId("jordan")).toBeNull();
    expect(parseLeftoverFixtureId("maria")).toBeNull();
    expect(leftoverFixtureHref("/playbook", "fixture-1")).toBe("/playbook?fixture=fixture-1");
    expect(withLeftoverFixture("/playbook/starting", "fixture-1")).toBe(
      "/playbook/starting?fixture=fixture-1",
    );
    expect(withLeftoverFixture("/playbook", null)).toBe("/playbook");
  });

  it("ranks leftover resources with the selected Part 2 fixture", () => {
    const needles = leftoverFixtureNeedles(loadCompanyFixture("fixture-1"));
    expect(needles).toEqual(expect.arrayContaining(["healthcare", "ai", "saas"]));
    const rows: CatalogResource[] = [
      {
        id: "trade",
        externalId: "trade",
        title: "Utah Office of International Trade",
        description: "Export counseling.",
        communities: [],
        industries: [],
        locations: [],
        topics: ["International Trade"],
        link: null,
        email: null,
      },
      {
        id: "health",
        externalId: "health",
        title: "BioHive healthcare network",
        description: "Life sciences and healthcare software.",
        communities: [],
        industries: ["Life Sciences and Healthcare"],
        locations: [],
        topics: ["Funding"],
        link: null,
        email: null,
      },
    ];
    expect(rankResourcesForNeedles(rows, needles).map((row) => row.id)).toEqual([
      "health",
      "trade",
    ]);
  });

  it("keeps leftover fixture ids client-safe", () => {
    const helper = readFileSync(
      path.join(process.cwd(), "src/lib/catalog/leftover-test-case.ts"),
      "utf8",
    );
    expect(helper).not.toMatch(/load-fixture|node:fs/);
    expect(parseLeftoverFixtureId("jordan")).toBeNull();
  });
});
