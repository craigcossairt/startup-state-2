import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BONUS_CONTROLS } from "@/components/bonus-bar";
import { FIT_LABELS, NOT_PUBLISHED, TEST_CASES_LABEL } from "@/lib/copy";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("Opportunity Map shell", () => {
  it("restores a cached map, paints retrieved cards while ranking, and keeps filters off the bonus row", () => {
    const map = read("src/components/opportunity-map.tsx");
    const filters = read("src/components/map-filter-bar.tsx");
    expect(map).toContain("loadCachedMap");
    expect(map).toContain("saveCachedMap");
    expect(map).toContain("peekCachedMap");
    expect(map).toContain("chipsReady");
    expect(map).toContain("pendingCardsFromPreviews");
    expect(map).not.toContain("CompanySnapshot");
    expect(map).not.toContain("profileOpen");
    expect(map).not.toContain("profileRevision");
    expect(map).toContain("requestYouBarToggle");
    expect(map).toContain("map-hero");
    expect(map).toContain("PROFILE_COMMITTED_EVENT");
    expect(map).toContain("rankNonce");
    expect(map).toContain("profileCacheKey");
    expect(map).toContain("MapFilterBar");
    expect(map).toContain("TEST_CASES_LABEL");
    expect(map).not.toContain("Found so far");
    expect(map).not.toMatch(/Official fixtures/i);
    expect(`${map}\n${filters}`).not.toMatch(/\d+%/);
    expect(`${map}\n${filters}`).not.toMatch(/confidence/i);
    expect(map).not.toContain("BonusBar");
  });

  it("watches the company search and asks from a FAB, not extra chip rows", () => {
    const map = read("src/components/opportunity-map.tsx");
    const filters = read("src/components/map-filter-bar.tsx");
    const layout = read("src/app/layout.tsx");
    const alerts = read("src/app/map/alerts/page.tsx");
    expect(map).toContain("Watch this search");
    expect(map).toContain("/map/alerts");
    expect(alerts).toContain("subscribeToSearch");
    expect(layout).toContain("AskFab");
    expect(BONUS_CONTROLS.map((item) => item.label)).toEqual(["Plan", "Graph"]);
    expect(TEST_CASES_LABEL).toBe("Test cases");
    expect(FIT_LABELS.likely).toBe("likely");
    expect(NOT_PUBLISHED).toBe("Not published");
  });

  it("paints similar awardees on each ranked card, including the empty label", () => {
    const card = read("src/components/ranked-card.tsx");
    expect(card).toContain("similarAwardees");
    expect(card).toContain("NONE_ATTACHED");
  });

  it("keeps the fixture rail on the map, not only inside Company profile", () => {
    const map = read("src/components/opportunity-map.tsx");
    expect(map).toContain("<FixtureRail");
    expect(map).not.toContain("CompanySnapshot");
    expect(map.indexOf("<FixtureRail")).toBeGreaterThan(map.indexOf("requestYouBarToggle"));
  });

  it("splits fixture resolve from re-rank so a commit cannot clobber via resolveProfile", () => {
    const map = read("src/components/opportunity-map.tsx");
    expect(map).toContain("resolveProfile(fixture)");
    expect(map).toMatch(/\[chipsReady, fixture\]/);
    expect(map).toContain("rankNonce");
    expect(map).not.toMatch(/\[chipsReady, fixture,[\s\S]*rankNonce/);
    const commitAt = map.indexOf("addEventListener(PROFILE_COMMITTED_EVENT");
    expect(commitAt).toBeGreaterThan(-1);
    const commitBlock = map.slice(Math.max(0, commitAt - 420), commitAt + 180);
    expect(commitBlock).toContain("loadStoredProfile");
    expect(commitBlock).toContain("setRankNonce");
    expect(commitBlock).not.toContain("resolveProfile");
  });
});
