export type SiteNavItem = {
  href: string;
  label: string;
};

export type FooterLegalLink =
  | { kind: "internal"; href: string; label: string }
  | { kind: "external"; href: string; label: string };

export const FOOTER_LEGAL_LINKS: FooterLegalLink[] = [
  { kind: "external", href: "https://utah.gov", label: "Utah.gov" },
  { kind: "internal", href: "/", label: "Home" },
  { kind: "internal", href: "/admin", label: "GOED admin" },
  { kind: "external", href: "https://startup.utah.gov", label: "startup.utah.gov" },
];

export const SITE_NAV: SiteNavItem[] = [
  { href: "/map", label: "Opportunities" },
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
