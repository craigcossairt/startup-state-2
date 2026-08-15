export const TECH_TOKEN_SUGGESTIONS = [
  "ai",
  "saas",
  "healthcare software",
  "manufacturing",
  "aerospace",
  "sensors",
  "iot",
  "cybersecurity",
  "marketplace",
  "mobile",
] as const;

export type TechTokenSuggestion = {
  token: string;
  kind: "match" | "create";
};

export function normalizeTechToken(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function commitTechToken(selected: string[], raw: string): string[] {
  const token = normalizeTechToken(raw);
  if (!token || selected.includes(token)) return selected;
  return [...selected, token];
}

export function suggestTechTokens(query: string, selected: string[]): TechTokenSuggestion[] {
  const needle = normalizeTechToken(query);
  const matches: TechTokenSuggestion[] = TECH_TOKEN_SUGGESTIONS.filter((token) => {
    if (selected.includes(token)) return false;
    return !needle || token.includes(needle);
  }).map((token) => ({ token, kind: "match" as const }));

  if (needle && !selected.includes(needle) && !matches.some((row) => row.token === needle)) {
    matches.push({ token: needle, kind: "create" });
  }
  return matches;
}
