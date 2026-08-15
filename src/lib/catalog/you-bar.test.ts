import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIXTURE_CHIPS } from "@/lib/copy";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("You bar", () => {
  it("is the leftover You bar with Part 2 test-case chips in the edit panel", () => {
    const bar = read("src/components/catalog/you-bar.tsx");
    expect(bar).toMatch(/>\s*You\s*</);
    expect(bar).toContain("Company profile");
    expect(bar).not.toContain("Refine your persona");
    expect(bar).toContain("TEST_CASES_LABEL");
    expect(bar).toContain("FIXTURE_CHIPS");
    expect(bar).toContain("applyTestCase");
    expect(bar).toContain("YOU_STORAGE_KEY");
    expect(bar).toContain("prepareBarApply");
    expect(bar).toContain("persistBarApply");
    expect(bar).toContain("MustHaveField");
    expect(bar).toContain("Fields the ranking uses");
    expect(bar).toContain("intake-cta");
    expect(bar).toContain("MAP_EMPTY_CTA");
    expect(bar).toContain("YOU_BAR_TOGGLE_EVENT");
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

  it("hides leftover test-case chips in dual mode and keeps them on leftover pages", () => {
    const bar = read("src/components/catalog/you-bar.tsx");
    expect(bar).toMatch(/draft\.mode === "persona"[\s\S]*TEST_CASES_LABEL|TEST_CASES_LABEL[\s\S]*draft\.mode === "persona"/);
    expect(bar).toContain('mode === "dual"');
  });

  it("keeps YouParamLink search params behind Suspense so playbook steps can prerender", () => {
    const link = read("src/components/catalog/you-param-link.tsx");
    expect(link).toContain("useSearchParams");
    expect(link).toMatch(/<Suspense[\s\S]*useSearchParams|function YouParamLink[\s\S]*<Suspense/);
  });

  it("constrains an open Company profile panel so it scrolls inside the sticky bar", () => {
    const bar = read("src/components/catalog/you-bar.tsx");
    expect(bar).toMatch(/max-h-\[calc\(100dvh-3\.5rem\)\]/);
    expect(bar).toMatch(/open && draft[\s\S]*overflow-y-auto|overflow-y-auto[\s\S]*open && draft/);
    const openAt = bar.indexOf("{open && draft");
    expect(openAt).toBeGreaterThan(-1);
    const openBlock = bar.slice(openAt, openAt + 280);
    expect(openBlock).toContain("overflow-y-auto");
    expect(openBlock).toContain("min-h-0");
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
