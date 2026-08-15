import { describe, expect, it } from "vitest";
import { FOOTER_LEGAL_LINKS, SITE_NAV, navItemIsActive } from "@/lib/site-nav";

describe("SITE_NAV", () => {
  it("lists leftover surfaces beside Opportunities", () => {
    expect(SITE_NAV.map((item) => [item.href, item.label])).toEqual([
      ["/map", "Opportunities"],
      ["/playbook", "Playbook"],
      ["/resources", "Resources"],
      ["/startups", "Startups"],
      ["/careers", "Careers"],
      ["/news", "News"],
      ["/swag", "Swag"],
    ]);
  });

  it("keeps the footer legal band to leftover density plus GOED admin", () => {
    expect(FOOTER_LEGAL_LINKS.map((item) => [item.href, item.label])).toEqual([
      ["https://utah.gov", "Utah.gov"],
      ["/", "Home"],
      ["/admin", "GOED admin"],
      ["https://startup.utah.gov", "startup.utah.gov"],
    ]);
    expect(FOOTER_LEGAL_LINKS.some((item) => item.href === "/playbook")).toBe(false);
  });

  it("marks nested playbook and map routes active without stealing home", () => {
    expect(navItemIsActive("/", "/map")).toBe(false);
    expect(navItemIsActive("/map", "/map")).toBe(true);
    expect(navItemIsActive("/map/plan", "/map")).toBe(true);
    expect(navItemIsActive("/playbook/starting/find-space", "/playbook")).toBe(true);
    expect(navItemIsActive("/news", "/swag")).toBe(false);
  });
});
