import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CLAIM_MAIL_UNAVAILABLE,
  evaluateClaim,
  findCatalogStartup,
  submitClaimRequest,
  websiteDomain,
} from "./claim";
import type { CatalogStartup } from "./types";

describe("startup claim", () => {
  it("checks work email against the listing website domain", () => {
    expect(websiteDomain("https://www.alcomy.com/about")).toBe("alcomy.com");
    expect(websiteDomain(null)).toBeNull();
    expect(evaluateClaim({ website: null, email: "a@b.com", name: "Alcomy" }).ok).toBe(false);
    expect(
      evaluateClaim({ website: "alcomy.com", email: "founders@other.com", name: "Alcomy" }),
    ).toEqual({
      ok: false,
      error: "Your email must be at @alcomy.com to verify ownership of Alcomy.",
    });
    expect(evaluateClaim({ website: "alcomy.com", email: "you@alcomy.com", name: "Alcomy" })).toEqual({
      ok: true,
      domain: "alcomy.com",
    });
  });

  it("records a matching claim without pretending a sign-in link was mailed", () => {
    const alcomy: CatalogStartup = {
      id: "alcomy",
      slug: "alcomy",
      name: "Alcomy",
      website: "https://www.alcomy.com/about",
      linkedinUrl: null,
      description: null,
      fullAddress: null,
      city: null,
      region: null,
      lat: null,
      lng: null,
      sector: "Software",
      stage: null,
      employeesBucket: "Undisclosed",
      revenueBucket: "Undisclosed",
      foundingYear: null,
      isHiring: false,
      careersUrl: null,
    };
    expect(findCatalogStartup([alcomy], "alcomy")?.name).toBe("Alcomy");
    expect(
      submitClaimRequest({
        startups: [alcomy],
        startupId: "missing",
        email: "you@alcomy.com",
      }).ok,
    ).toBe(false);
    expect(
      submitClaimRequest({
        startups: [alcomy],
        startupId: "alcomy",
        email: "you@other.com",
      }),
    ).toEqual({
      ok: false,
      error: "Your email must be at @alcomy.com to verify ownership of Alcomy.",
      status: 400,
    });
    expect(
      submitClaimRequest({
        startups: [alcomy],
        startupId: "alcomy",
        email: "you@alcomy.com",
      }),
    ).toEqual({
      ok: true,
      domain: "alcomy.com",
      mailed: false,
      message: CLAIM_MAIL_UNAVAILABLE,
    });
    expect(CLAIM_MAIL_UNAVAILABLE).toContain("business@utah.gov");
    expect(CLAIM_MAIL_UNAVAILABLE).not.toMatch(/inbox/i);
  });

  it("ships a claim page and a Claim this listing control on the startup map", () => {
    const root = process.cwd();
    expect(existsSync(path.join(root, "src/app/claim/[id]/page.tsx"))).toBe(true);
    const directory = readFileSync(
      path.join(root, "src/components/catalog/startup-detail-panel.tsx"),
      "utf8",
    );
    expect(directory).toContain("/claim/");
    expect(directory).toContain("Claim this listing");
    expect(directory).not.toMatch(/Tyler|canvas-confetti/i);
    const page = readFileSync(path.join(root, "src/app/claim/[id]/page.tsx"), "utf8");
    const api = readFileSync(path.join(root, "src/app/api/claim/route.ts"), "utf8");
    expect(page).toContain("websiteDomain");
    expect(api).toContain("submitClaimRequest");
    expect(api).not.toMatch(/z\.string\(\)\.uuid\(\)/);
  });
});
