import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FIT_HELP,
  FLOOR_EYEBROW,
  FLOOR_FOLLOW,
  INTAKE_CTA,
  INTAKE_HERO,
  INTAKE_LANDING_TITLE,
  INTAKE_LEAD,
  INTAKE_ROLE_FOUNDER,
  JOURNEY_TITLE,
  MAP_NAV_LABEL,
  RETRIEVE_HEADING,
  VERIFY_HEADING,
  WHY_HEADING,
} from "@/lib/copy";
import { SITE_NAV } from "@/lib/site-nav";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("Claude Design look", () => {
  it("keeps locked Intake card copy and adds the landing hero", () => {
    expect(INTAKE_HERO).toBe("Tell us about your company.");
    expect(INTAKE_LEAD).toContain("website");
    expect(INTAKE_LANDING_TITLE).toBe("Start Something Here");
    expect(INTAKE_CTA).toBe("Build my Opportunity Map");
    expect(INTAKE_ROLE_FOUNDER).toBe("I'm a founder");
    expect(JOURNEY_TITLE).toContain("every stage");
    const intake = read("src/components/intake.tsx");
    expect(intake).toContain("INTAKE_LANDING_TITLE");
    expect(intake).toContain("INTAKE_HERO");
    expect(intake).toContain("INTAKE_CTA");
    expect(intake).toContain("PlaybookStageGrid");
    expect(intake).toContain("INTAKE_ROLE_FOUNDER");
  });

  it("labels the map Opportunities and uses retrieve plus Fit as a sidebar", () => {
    expect(MAP_NAV_LABEL).toBe("Opportunities");
    expect(SITE_NAV[0]).toEqual({ href: "/map", label: "Opportunities" });
    expect(RETRIEVE_HEADING).toBe("Retrieve");
    expect(FIT_HELP).toContain("No new search");
    const map = read("src/components/opportunity-map.tsx");
    const filters = read("src/components/map-filter-bar.tsx");
    expect(map).toContain("MAP_EMPTY_CTA");
    expect(filters).toContain("RETRIEVE_HEADING");
    expect(filters).toContain("FIT_HEADING");
    expect(filters).not.toContain("Watch this search");
  });

  it("puts why, verify, and the locked floor sentence on the ranked listing", () => {
    expect(WHY_HEADING).toBe("Why this listing, for this company");
    expect(VERIFY_HEADING).toBe("Verify");
    expect(FLOOR_EYEBROW).toBe("Read this first");
    expect(FLOOR_FOLLOW).toContain("Nothing is hidden");
    const card = read("src/components/ranked-card.tsx");
    const map = read("src/components/opportunity-map.tsx");
    expect(card).toContain("WHY_HEADING");
    expect(card).toContain("VERIFY_HEADING");
    expect(card).toContain("formatDeadline");
    expect(map).toContain("FLOOR_EYEBROW");
    expect(map).toContain("FLOOR_BANNER");
  });
});
