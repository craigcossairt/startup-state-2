import type { CompanyProfile } from "@/lib/types/company-profile";

const KEYWORD_CAP = 200;

const SECTOR_LABELS: Record<string, string> = {
  healthcare: "healthcare",
  ai: "AI",
  saas: "SaaS",
  aerospace: "aerospace",
  manufacturing: "manufacturing",
  defense: "defense",
  water: "water",
  climate: "climate",
  environment: "environment",
  infrastructure: "infrastructure",
  cybersecurity: "cybersecurity",
  marketplace: "marketplace",
  education: "education",
  youth: "youth",
  workforce: "workforce",
};

export function buildGrantsGovKeyword(profile: CompanyProfile): string {
  const parts: string[] = [];
  if (profile.whatTheyDo.value) parts.push(profile.whatTheyDo.value);
  if (profile.technologies.value?.length) {
    parts.push(profile.technologies.value.join(" "));
  }
  if (profile.sectors.value?.length) {
    parts.push(
      profile.sectors.value.map((tag) => SECTOR_LABELS[tag] ?? tag).join(" "),
    );
  }
  const joined = parts.join(" ").replace(/\s+/g, " ").trim();
  return truncateAtWord(joined, KEYWORD_CAP);
}

function truncateAtWord(text: string, cap: number): string {
  if (text.length <= cap) return text;
  const sliced = text.slice(0, cap);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trim();
}
