import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FIXTURE_CHIPS,
  INTAKE_HERO,
  INTAKE_LEAD,
  INTAKE_WHAT_THEY_DO_HINT,
  INTAKE_WHAT_THEY_DO_LABEL,
  INTAKE_WEBSITE_LABEL,
} from "@/lib/copy";

describe("Intake copy", () => {
  it("locks the hero and the five test case labels", () => {
    expect(INTAKE_HERO).toBe("Tell us about your company.");
    expect(FIXTURE_CHIPS.map((chip) => chip.label)).toEqual([
      "Healthcare AI",
      "Aerospace",
      "Water / climate",
      "Cyber",
      "Youth marketplace (honest-no)",
    ]);
  });

  it("asks for a website first and a rich company description, not one sentence", () => {
    expect(INTAKE_WEBSITE_LABEL).toBe("Company website");
    expect(INTAKE_WHAT_THEY_DO_LABEL).toBe("What does the company do?");
    expect(INTAKE_WHAT_THEY_DO_LABEL.toLowerCase()).not.toContain("one sentence");
    expect(INTAKE_LEAD.toLowerCase()).toContain("website");
    expect(INTAKE_WHAT_THEY_DO_HINT).toContain("AI software");
    expect(INTAKE_WHAT_THEY_DO_HINT).toContain("Salt Lake City");
    expect(INTAKE_WHAT_THEY_DO_HINT).toContain("15 people");
    expect(INTAKE_WHAT_THEY_DO_HINT).toContain("$1M ARR");
    expect(INTAKE_WHAT_THEY_DO_HINT).not.toMatch(/—/);
  });

  it("keeps those strings on the Intake surface and out of Part 1 leftovers", () => {
    const intake = readFileSync(
      path.join(process.cwd(), "src", "components", "intake.tsx"),
      "utf8",
    );
    const nav = readFileSync(
      path.join(process.cwd(), "src", "components", "nav.tsx"),
      "utf8",
    );
    expect(intake).toContain("INTAKE_HERO");
    expect(intake).toContain("INTAKE_WEBSITE_LABEL");
    expect(intake).toContain("INTAKE_WHAT_THEY_DO_LABEL");
    expect(intake).toContain("INTAKE_WHAT_THEY_DO_HINT");
    expect(intake).toContain("FIXTURE_CHIPS");
    expect(intake).toContain("TEST_CASES_LABEL");
    expect(intake).toContain("{INTAKE_HERO}");
    expect(intake).toContain("{chip.label}");
    expect(intake).not.toMatch(/in one sentence/i);
    expect(intake).not.toMatch(/eligible|eligibility|coming soon|coming-soon/i);
    expect(nav).toContain("SITE_NAV");
  });
});
