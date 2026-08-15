export type SiteNavItem = {
  href: string;
  label: string;
};

export const SITE_NAV: SiteNavItem[] = [
  { href: "/map", label: "Opportunity Map" },
  { href: "/playbook", label: "Playbook" },
  { href: "/resources", label: "Resources" },
  { href: "/startups", label: "Startups" },
  { href: "/careers", label: "Careers" },
  { href: "/news", label: "News" },
  { href: "/swag", label: "Swag" },
];

export function navItemIsActive(pathname: string, href: string): boolean {
  if (href === "/map") {
    return pathname === "/map" || pathname.startsWith("/map/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
