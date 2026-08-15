import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ASK_FAB_LABEL,
  ASK_NEEDS_MAP,
  ASK_PANEL_LEAD,
  FOOTER_CONNECT_EYEBROW,
  FOOTER_EMAIL,
  FOOTER_GOEO_ADDRESS_1,
  FOOTER_GOEO_NAME,
  FOOTER_NEWSLETTER_CTA,
  FOOTER_OFFICIAL_LINE,
  INTAKE_HERO,
  WELCOME_BACK_ACTION,
  WELCOME_BACK_BANNER,
} from "@/lib/copy";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

function walkSrcFiles(dir = path.join(root, "src")): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkSrcFiles(full));
      continue;
    }
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

describe("Part 1 site chrome import fences", () => {
  it("keeps official footer copy free of em dashes and admin easter eggs", () => {
    expect(FOOTER_CONNECT_EYEBROW).toBe("Let's connect");
    expect(FOOTER_OFFICIAL_LINE).toBe("An official state of Utah website");
    expect(FOOTER_GOEO_NAME).toContain("GOEO");
    expect(FOOTER_GOEO_ADDRESS_1).toContain("South Temple");
    expect(FOOTER_EMAIL).toBe("business@utah.gov");
    expect(FOOTER_NEWSLETTER_CTA).toBe("Subscribe to Newsletter");
    expect(WELCOME_BACK_BANNER).toContain("Opportunity Map");
    expect(WELCOME_BACK_ACTION).toBe("Open last Opportunity Map");
    expect(ASK_FAB_LABEL).toBe("Navigator");
    expect(ASK_NEEDS_MAP).toContain("Navigator");
    expect(ASK_PANEL_LEAD).toContain("playbook");
    const locked = [
      FOOTER_CONNECT_EYEBROW,
      FOOTER_OFFICIAL_LINE,
      FOOTER_GOEO_NAME,
      FOOTER_NEWSLETTER_CTA,
      WELCOME_BACK_BANNER,
      ASK_FAB_LABEL,
      ASK_PANEL_LEAD,
      ASK_NEEDS_MAP,
    ].join("\n");
    expect(locked).not.toMatch(/—/);
    expect(locked).not.toMatch(/Tyler|confetti|easter egg/i);
  });

  it("allows 127.0.0.1 to load Next.js dev resources", () => {
    const config = read("next.config.ts");
    expect(config).toMatch(/^\s*allowedDevOrigins:\s*\[[^\]]*['"]127\.0\.0\.1['"]/m);
  });

  it("mounts Footer and AskFab from the root layout", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain("Footer");
    expect(layout).toContain("AskFab");
    expect(layout).toContain('from "@/components/footer"');
    expect(layout).toContain('from "@/components/ask-fab"');
  });

  it("ports the official Utah footer without admin or Tyler", () => {
    const footer = read("src/components/footer.tsx");
    expect(footer).toContain("FOOTER_CONNECT_EYEBROW");
    expect(footer).toContain("FOOTER_OFFICIAL_LINE");
    expect(footer).toContain("FOOTER_GOEO_NAME");
    expect(footer).toContain("ss-stacked-white.png");
    expect(footer).toContain("goeo-only-white.png");
    expect(footer).not.toMatch(/admin|Tyler|tyler-card|confetti/i);
    expect(footer).toContain("SITE_NAV");
  });

  it("gives Intake the Part 1 topographic hero and welcome-back banner", () => {
    const intake = read("src/components/intake.tsx");
    expect(intake).toContain("topography-tile.webp");
    expect(intake).toContain("WelcomeBack");
    expect(intake).toContain("{INTAKE_HERO}");
    expect(INTAKE_HERO).toBe("Tell us about your company.");
  });

  it("puts leftover surfaces on the nav and still forbids the Tyler card", () => {
    const nav = read("src/components/nav.tsx");
    expect(nav).toContain("SITE_NAV");
    expect(read("src/lib/site-nav.ts")).toContain("Playbook");
    expect(existsSync(path.join(root, "src/components/admin/tyler-card.tsx"))).toBe(
      false,
    );
    const blob = walkSrcFiles()
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(blob).not.toMatch(/TylerCard|canvas-confetti|For Tyler/i);
    expect(blob).not.toMatch(/from "framer-motion"|from 'framer-motion'/);
  });
});

describe("Part 1 brand assets in git", () => {
  it("commits the official lockups the nav and footer already name", () => {
    const required = [
      "public/brand/ss-horiz-color.png",
      "public/brand/goeo-only-color.png",
      "public/brand/ss-stacked-white.png",
      "public/brand/goeo-only-white.png",
      "public/brand/topography-tile.webp",
    ];
    const patterns = [
      "public/brand/large-gradient-pattern.svg",
      "public/brand/small-icon-pattern.svg",
    ];
    for (const rel of patterns) {
      expect(existsSync(path.join(root, rel)), rel).toBe(true);
    }
    for (const rel of required) {
      const full = path.join(root, rel);
      expect(existsSync(full), rel).toBe(true);
      expect(statSync(full).size, rel).toBeGreaterThan(1000);
    }
  });
});
