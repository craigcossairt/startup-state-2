import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildAdminSnapshot } from "./admin-snapshot";

const root = process.cwd();

describe("GOED admin snapshot", () => {
  it("names honest queue states instead of empty supabase tables", () => {
    expect(
      buildAdminSnapshot({ resources: 213, startups: 220, playbookSteps: 19 }),
    ).toEqual({
      resources: 213,
      startups: 220,
      playbookSteps: 19,
      queues: {
        pendingListings: "not-persisted",
        claims: "not-persisted",
        leftoverWatches: "device-only",
      },
    });
  });

  it("ships /admin without the Tyler card", () => {
    const page = path.join(root, "src/app/admin/page.tsx");
    expect(existsSync(page)).toBe(true);
    const source = readFileSync(page, "utf8");
    expect(source).toContain("buildAdminSnapshot");
    expect(source).toContain("Operations");
    expect(source).not.toMatch(/Tyler|tyler-card|canvas-confetti|framer-motion/i);
    expect(existsSync(path.join(root, "src/components/admin/tyler-card.tsx"))).toBe(
      false,
    );
  });
});
