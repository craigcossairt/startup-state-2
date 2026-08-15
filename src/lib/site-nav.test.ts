import { describe, expect, it } from "vitest";
import { SITE_NAV, navItemIsActive } from "@/lib/site-nav";

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

  it("marks nested playbook and map routes active without stealing home", () => {
    expect(navItemIsActive("/", "/map")).toBe(false);
    expect(navItemIsActive("/map", "/map")).toBe(true);
    expect(navItemIsActive("/map/plan", "/map")).toBe(true);
    expect(navItemIsActive("/playbook/starting/find-space", "/playbook")).toBe(true);
    expect(navItemIsActive("/news", "/swag")).toBe(false);
  });
});
