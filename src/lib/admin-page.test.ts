import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("admin page", () => {
  it("paints the five leftover sections with green-circle icons and live fixture rows", () => {
    const page = read("src/app/admin/page.tsx");
    const icons = read("src/components/admin/admin-icon.tsx");
    expect(page).toContain("loadAdminOperations");
    expect(page).toContain("Pending submissions");
    expect(page).toContain("Claim queue");
    expect(page).toContain("Investor + talent outreach lists");
    expect(page).toContain("Saved-search subscribers");
    expect(page).toContain("Startup edit audit log");
    expect(page).toContain("AdminIcon");
    expect(icons).toContain("rounded-full");
    expect(icons).toContain("bg-vibrant-green");
    expect(page).toContain("PendingSubmissions");
    expect(page).toContain("AuditLog");
    expect(page).toContain("TylerCard");
    expect(page).not.toContain("Catalog inventory");
    expect(page).toContain("gated by GOED-domain SSO");
  });

  it("ships the Tyler card on admin only, without framer-motion or confetti", () => {
    const card = path.join(root, "src/components/admin/tyler-card.tsx");
    expect(existsSync(card)).toBe(true);
    const source = read("src/components/admin/tyler-card.tsx");
    expect(source).toContain("For Tyler");
    expect(source).toContain("TAP TO OPEN");
    expect(source).not.toMatch(/framer-motion|canvas-confetti/i);
    const leftover = [
      "src/components/footer.tsx",
      "src/components/nav.tsx",
      "src/app/playbook/page.tsx",
      "src/app/resources/page.tsx",
    ]
      .map(read)
      .join("\n");
    expect(leftover).not.toMatch(/TylerCard|For Tyler/i);
  });

  it("opens each outreach list from the catalog filter", () => {
    const page = read("src/app/list/[slug]/page.tsx");
    expect(page).toContain("filterStartupsForList");
    expect(page).toContain("loadAdminOperations");
    expect(page).toContain("Back to GOED admin");
  });
});
