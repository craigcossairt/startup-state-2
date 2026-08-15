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

  it("always mounts the Utah plot, even when Mapbox is off", () => {
    const client = readFileSync(
      path.join(root, "src/components/catalog/startup-map-client.tsx"),
      "utf8",
    );
    const map = readFileSync(path.join(root, "src/components/catalog/utah-startup-map.tsx"), "utf8");
    expect(client).toContain("UtahStartupMap");
    expect(client).toContain("MapFilterPanel");
    expect(map).toContain("MAPBOX_MISSING_COPY");
    expect(map).toContain("mapboxToken");
    const fab = readFileSync(path.join(root, "src/components/ask-fab.tsx"), "utf8");
    expect(fab).toContain("rect.bottom > 0");
  });

  it("ports the Part 1 startups map, careers filters, and playbook roadmap", () => {
    const startups = readFileSync(path.join(root, "src/app/startups/page.tsx"), "utf8");
    const careers = readFileSync(path.join(root, "src/app/careers/page.tsx"), "utf8");
    const playbook = readFileSync(path.join(root, "src/app/playbook/page.tsx"), "utf8");
    const clustered = readFileSync(path.join(root, "src/components/catalog/utah-map.tsx"), "utf8");
    expect(startups).toContain("StartupMapClient");
    expect(startups).toContain("readMapboxPublicToken");
    expect(clustered).toContain("cluster");
    expect(clustered).toContain("mapboxAccessToken");
    expect(careers).toContain("TalentFilters");
    expect(careers).toContain("/startups?startup=");
    expect(careers).toContain("View open roles");
    expect(playbook).toContain("PersonalizedRoadmap");
    expect(playbook).toContain("ResumeBanner");
    expect(playbook).toContain("written for you.");
    expect(playbook).toContain("GOED");
    expect(playbook).not.toMatch(/\bGOEO\b/);
  });

  it("ports Part 1 playbook progress, resource ranking chrome, and leftover polish", () => {
    const playbook = readFileSync(path.join(root, "src/app/playbook/page.tsx"), "utf8");
    const stage = readFileSync(path.join(root, "src/app/playbook/[stage]/page.tsx"), "utf8");
    const step = readFileSync(path.join(root, "src/app/playbook/[stage]/[step]/page.tsx"), "utf8");
    const grid = readFileSync(path.join(root, "src/components/catalog/playbook-stage-grid.tsx"), "utf8");
    const stageCard = readFileSync(path.join(root, "src/components/catalog/stage-card-link.tsx"), "utf8");
    const resourcesPage = readFileSync(path.join(root, "src/app/resources/page.tsx"), "utf8");
    const directory = readFileSync(
      path.join(root, "src/components/catalog/resource-directory.tsx"),
      "utf8",
    );
    const news = readFileSync(path.join(root, "src/app/news/page.tsx"), "utf8");
    const claim = readFileSync(path.join(root, "src/app/claim/[id]/page.tsx"), "utf8");
    expect(playbook).toContain("ResumeBanner");
    expect(grid).toContain("StageCardLink");
    expect(stageCard).toContain("completedInStage");
    expect(stage).toContain("StepCardLink");
    expect(stage).toMatch(/<Suspense fallback=\{null\}>\s*<ol[\s\S]*?<StepCardLink/);
    expect(step).toContain("StepCompleteToggle");
    expect(step).toContain("StepNavFooter");
    expect(resourcesPage).toContain("ranked for you");
    expect(directory).toContain("communityFilter");
    expect(directory).toContain("matchResources");
    expect(directory).toContain("reasons");
    expect(directory).toContain("setLimit");
    expect(directory).toContain("more");
    expect(directory).not.toMatch(/framer-motion/);
    expect(news).toContain("Read on startup.utah.gov");
    expect(news).toContain("SurfaceHero");
    expect(claim).toContain("/startups?startup=");
    expect(claim).toContain("CompanyLogo");
  });

  it("ports leftover dropdowns, saved-search, add listing, and empty You glow", () => {
    const directory = readFileSync(
      path.join(root, "src/components/catalog/resource-directory.tsx"),
      "utf8",
    );
    const panel = readFileSync(
      path.join(root, "src/components/catalog/map-filter-panel.tsx"),
      "utf8",
    );
    const talent = readFileSync(path.join(root, "src/components/catalog/talent-filters.tsx"), "utf8");
    const you = readFileSync(path.join(root, "src/components/catalog/you-bar.tsx"), "utf8");
    const addPage = readFileSync(path.join(root, "src/app/startups/add/page.tsx"), "utf8");
    const addApi = readFileSync(path.join(root, "src/app/api/startups/add/route.ts"), "utf8");
    const news = readFileSync(path.join(root, "src/app/news/page.tsx"), "utf8");
    expect(directory).toContain("FilterDropdown");
    expect(directory).toContain("Topic");
    expect(directory).toContain("Community");
    expect(panel).toContain("/startups/add");
    expect(panel).toContain("SaveSearchButton");
    expect(talent).toContain("SaveSearchButton");
    expect(readFileSync(path.join(root, "src/components/catalog/save-search-button.tsx"), "utf8")).toContain(
      "persistLeftoverWatch",
    );
    expect(you).toContain("persona-bar-breathing");
    expect(addPage).toContain("AddListingForm");
    expect(addPage).not.toMatch(/coming soon|coming-soon/i);
    expect(addApi).toContain("submitAddListing");
    expect(addApi).not.toMatch(/insert into/);
    expect(addApi).not.toMatch(/pending/);
    expect(news).toContain("SurfaceHero");
  });

  it("applies leftover catalog schema during build and never inserts startup status", () => {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.build).toContain("scripts/apply-catalog-schema.mjs");
    const script = readFileSync(path.join(root, "scripts/apply-catalog-schema.mjs"), "utf8");
    expect(script).toContain("supabase/schema.sql");
    expect(script).toContain("insert into public.startups");
    expect(script).toContain("rejectUnauthorized: false");
    expect(script).toContain("stripSslMode");
    expect(script).not.toMatch(/insert into public\.startups[\s\S]*\bstatus\b/);
  });

  it("commits the swag photos the swag page names", () => {
    for (const item of SWAG_ITEMS) {
      const full = path.join(root, "public", item.src.replace(/^\//, ""));
      expect(existsSync(full), item.src).toBe(true);
      expect(statSync(full).size, item.src).toBeGreaterThan(1000);
    }
  });
});
