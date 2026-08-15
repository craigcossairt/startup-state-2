import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIXTURE_CHIPS } from "@/lib/copy";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("You bar", () => {
  it("is the Part 1 You bar with Part 2 test-case chips in the edit panel", () => {
    const bar = read("src/components/catalog/you-bar.tsx");
    expect(bar).toMatch(/>\s*You\s*</);
    expect(bar).toContain("Refine your persona");
    expect(bar).toContain("TEST_CASES_LABEL");
    expect(bar).toContain("FIXTURE_CHIPS");
    expect(bar).toContain("applyTestCase");
    expect(bar).toContain("YOU_STORAGE_KEY");
    expect(bar).not.toMatch(/pick a test persona|DEMO_PERSONAS|jordan|maria/i);
    expect(bar).toContain("persona-bar-breathing");
    expect(bar).toContain("Tell us about your business to get a personalized action plan");
    expect(FIXTURE_CHIPS.map((chip) => chip.label)).toEqual([
      "Healthcare AI",
      "Aerospace",
      "Water / climate",
      "Cyber",
      "Youth marketplace (honest-no)",
    ]);
  });

  it("mounts on Opportunity Map, Playbook, and Resources", () => {
    expect(read("src/app/map/page.tsx")).toContain("YouBar");
    expect(read("src/app/playbook/page.tsx")).toContain("YouBar");
    expect(read("src/app/playbook/[stage]/page.tsx")).toContain("YouBar");
    expect(read("src/app/playbook/[stage]/[step]/page.tsx")).toContain("YouBar");
    expect(read("src/app/resources/page.tsx")).toContain("YouBar");
    expect(read("src/components/catalog/resource-directory.tsx")).toContain("matchResources");
    expect(read("src/components/opportunity-map.tsx")).toContain("filterRankedCards");
    expect(existsSync(path.join(root, "src/components/catalog/leftover-test-case-bar.tsx"))).toBe(
      false,
    );
  });
});
