import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BONUS_CONTROLS } from "@/components/bonus-bar";

describe("bonus controls", () => {
  it("ships every stretch surface as a real control and never says coming soon", () => {
    expect(BONUS_CONTROLS.map((item) => item.label)).toEqual([
      "Checklist",
      "12-month",
      "Similar companies",
      "Alerts",
      "Chat",
      "Agencies",
      "Graph",
    ]);
    const map = readFileSync(
      path.join(process.cwd(), "src", "components", "opportunity-map.tsx"),
      "utf8",
    );
    const intake = readFileSync(
      path.join(process.cwd(), "src", "components", "intake.tsx"),
      "utf8",
    );
    const nav = readFileSync(
      path.join(process.cwd(), "src", "components", "nav.tsx"),
      "utf8",
    );
    expect(map).toContain("BonusBar");
    expect(intake).toContain("Open last Opportunity Map");
    expect(intake).toContain("restoreLastCompanyProfile");
    const blob = `${map}\n${intake}\n${nav}`;
    expect(blob).not.toMatch(/coming soon|coming-soon/i);
    expect(nav).not.toMatch(/Playbook|Careers|Swag|News/i);
    for (const item of BONUS_CONTROLS) {
      const page = item.href.replace("/map/", "");
      const source = readFileSync(
        path.join(process.cwd(), "src", "app", "map", page, "page.tsx"),
        "utf8",
      );
      expect(source.length).toBeGreaterThan(40);
    }
  });
});
