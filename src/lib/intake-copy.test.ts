import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIXTURE_CHIPS, INTAKE_HERO } from "@/lib/copy";

describe("Intake copy", () => {
  it("locks the hero and the five official fixture labels", () => {
    expect(INTAKE_HERO).toBe("Tell us about your company.");
    expect(FIXTURE_CHIPS.map((chip) => chip.label)).toEqual([
      "Healthcare AI",
      "Aerospace",
      "Water / climate",
      "Cyber",
      "Youth marketplace (honest-no)",
    ]);
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
    expect(intake).toContain("FIXTURE_CHIPS");
    expect(intake).toContain("{INTAKE_HERO}");
    expect(intake).toContain("{chip.label}");
    expect(`${intake}\n${nav}`).not.toMatch(/Playbook|Careers|Swag|News|eligible|eligibility/i);
  });
});
