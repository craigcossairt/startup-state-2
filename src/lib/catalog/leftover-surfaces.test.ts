import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NEWS_ITEMS } from "./news";
import { parseResourceList, parseStartupList } from "./parse";
import { PLAYBOOK_STEPS } from "./playbook";
import { SITE_NAV } from "@/lib/site-nav";
import { SWAG_ITEMS } from "./swag";

const root = process.cwd();

describe("leftover surfaces", () => {
  it("ships a real page for every SITE_NAV href except the existing Opportunity Map", () => {
    for (const item of SITE_NAV) {
      if (item.href === "/map") continue;
      const page = path.join(root, "src/app", item.href.slice(1), "page.tsx");
      expect(existsSync(page), page).toBe(true);
      const source = readFileSync(page, "utf8");
      expect(source).not.toMatch(/coming soon|coming-soon/i);
      expect(source).not.toMatch(/Tyler|canvas-confetti/i);
    }
  });

  it("loads the committed GOEO and startup catalogs", () => {
    const resources = parseResourceList(
      JSON.parse(readFileSync(path.join(root, "data/catalog/resources.json"), "utf8")),
    );
    const startups = parseStartupList(
      JSON.parse(readFileSync(path.join(root, "data/catalog/startups.json"), "utf8")),
    );
    expect(resources.length).toBe(213);
    expect(startups.length).toBe(220);
    expect(startups.every((row) => typeof row.lat === "number")).toBe(true);
    expect(PLAYBOOK_STEPS).toHaveLength(19);
    expect(NEWS_ITEMS).toHaveLength(10);
    expect(SWAG_ITEMS).toHaveLength(9);
  });

  it("commits the swag photos the swag page names", () => {
    for (const item of SWAG_ITEMS) {
      const full = path.join(root, "public", item.src.replace(/^\//, ""));
      expect(existsSync(full), item.src).toBe(true);
      expect(statSync(full).size, item.src).toBeGreaterThan(1000);
    }
  });
});
