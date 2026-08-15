import type { YouPersona, YouCommunity, YouGoal, YouRegion, YouSector, YouStage } from "./you-persona";
import type { CatalogResource } from "./types";
import type { RankedCard } from "@/lib/types/opportunity";

const GOAL_TOPICS: Record<YouGoal, string[]> = {
  "Find funding": ["Funding"],
  "Get first customers": ["Marketing and Sales", "Entrepreneurship Communities"],
  Hire: ["Late Stage Growth"],
  "Expand internationally": ["International Trade"],
  "Just exploring": ["Start a Business", "Entrepreneurship Communities"],
};

const STAGE_TOPICS: Record<YouStage, string[]> = {
  Thinking: ["Start a Business", "Entrepreneurship Communities"],
  Starting: ["Start a Business", "Entrepreneurship Communities", "Funding", "Marketing and Sales"],
  Growing: ["Late Stage Growth", "International Trade", "Funding", "Marketing and Sales"],
  Closing: ["Late Stage Growth", "International Trade", "Close or Exit a Business"],
};

const SECTOR_INDUSTRIES: Record<YouSector, string[]> = {
  Software: ["Software and Information Technology"],
  FinTech: ["Financial Services", "Software and Information Technology"],
  BioMedical: ["Life Sciences and Healthcare"],
  Manufacturing: ["Manufacturing"],
  Agriculture: ["Agriculture"],
  Consumer: ["Consumer Packaged Goods", "Hospitality and Food Services"],
  Energy: ["Other"],
  Security: ["Aerospace and Defense"],
  Marketplaces: ["Other"],
  Other: ["Other"],
};

const REGION_TO_COUNTIES: Record<YouRegion, string[]> = {
  "Wasatch Front": ["Salt Lake", "Utah", "Davis", "Weber", "Tooele"],
  "Northern Utah": ["Cache", "Box Elder", "Rich", "Morgan"],
  "Southern Utah": ["Washington", "Iron", "Beaver", "Garfield", "Kane"],
  Rural: [
    "Daggett",
    "Duchesne",
    "Uintah",
    "Sanpete",
    "Sevier",
    "Juab",
    "Millard",
    "Carbon",
    "Emery",
    "Grand",
    "San Juan",
    "Wayne",
    "Piute",
    "Summit",
    "Wasatch",
  ],
};

export type MatchReason = {
  kind: "goal" | "stage" | "community" | "industry" | "any";
  label: string;
};

export type ScoredResource = {
  resource: CatalogResource;
  score: number;
  reasons: MatchReason[];
};

export function filterResourcesByRegion(
  rows: CatalogResource[],
  persona: YouPersona | null,
): CatalogResource[] {
  if (!persona) return rows;
  const counties = new Set(REGION_TO_COUNTIES[persona.region] ?? []);
  return rows.filter((row) => {
    const locs = row.locations ?? [];
    if (locs.length === 0 || locs.length > 8) return true;
    return locs.some((county) => counties.has(county));
  });
}

export function matchResources(persona: YouPersona, resources: CatalogResource[]): ScoredResource[] {
  const goalTopics = new Set(GOAL_TOPICS[persona.goal] ?? []);
  const stageTopics = new Set(STAGE_TOPICS[persona.stage] ?? []);
  const personaCommunities = new Set(persona.communities.map(normalizeCommunity));
  const sectorIndustries = new Set(SECTOR_INDUSTRIES[persona.sector] ?? []);
  const personaCounties = new Set(REGION_TO_COUNTIES[persona.region] ?? []);

  const scored = resources.map<ScoredResource>((raw) => {
    const row: CatalogResource = {
      ...raw,
      topics: raw.topics ?? [],
      communities: raw.communities ?? [],
      industries: raw.industries ?? [],
      locations: raw.locations ?? [],
    };
    let score = 0;
    const reasons: MatchReason[] = [];
    const matchedGoal = row.topics.filter((topic) => goalTopics.has(topic));
    if (matchedGoal.length > 0) {
      score += 3 * matchedGoal.length;
      reasons.push({ kind: "goal", label: `For ${persona.goal.toLowerCase()}` });
    }
    const matchedStage = row.topics.filter((topic) => stageTopics.has(topic));
    if (matchedStage.length > 0 && matchedGoal.length === 0) {
      score += 1.5 * matchedStage.length;
      reasons.push({ kind: "stage", label: `${persona.stage.toLowerCase()} stage` });
    }
    if (personaCommunities.size > 0) {
      const matched = row.communities.map(normalizeCommunity).filter((item) => personaCommunities.has(item));
      if (matched.length > 0) {
        score += 4 * matched.length;
        reasons.push({ kind: "community", label: matched.map(prettyCommunity).join(" + ") });
      } else if (row.communities.includes("Any")) score += 0.5;
    } else if (row.communities.includes("Any")) {
      score += 0.2;
    }
    if (row.industries.length > 0 && row.industries.length <= 3) {
      const matched = row.industries.filter((item) => sectorIndustries.has(item));
      if (matched.length > 0) {
        score += 2 * matched.length;
        reasons.push({ kind: "industry", label: `${persona.sector} focus` });
      }
    }
    if (row.locations.length > 0 && row.locations.length <= 8) {
      const matched = row.locations.filter((item) => personaCounties.has(item));
      if (matched.length > 0) score += 0.3 * matched.length;
    }
    return { resource: row, score, reasons };
  });

  scored.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.resource.title.localeCompare(right.resource.title);
  });
  return scored;
}

export function resourcesForPersona(
  rows: CatalogResource[],
  persona: YouPersona | null,
): CatalogResource[] {
  const regioned = filterResourcesByRegion(rows, persona);
  if (!persona) return regioned;
  return matchResources(persona, regioned).map((item) => item.resource);
}

export function filterRankedCards(cards: RankedCard[], persona: YouPersona | null): RankedCard[] {
  if (!persona) return cards;
  const needles = [persona.sector, persona.goal, persona.stage].map((item) => item.toLowerCase());
  const scored = cards.map((card) => {
    const hay = `${card.opportunity.program} ${card.why} ${card.opportunity.instrument}`.toLowerCase();
    const score = needles.reduce((sum, needle) => sum + (hay.includes(needle) ? 1 : 0), 0);
    const funding =
      persona.goal === "Find funding" &&
      (card.opportunity.instrument === "grant" || card.opportunity.instrument === "loan")
        ? 2
        : 0;
    const trade =
      persona.goal === "Expand internationally" && hay.includes("trade") ? 2 : 0;
    const hire = persona.goal === "Hire" && hay.includes("workforce") ? 2 : 0;
    return { card, score: score + funding + trade + hire };
  });
  const hits = scored.filter((item) => item.score > 0);
  if (hits.length === 0) return cards;
  return hits
    .sort((left, right) => right.score - left.score)
    .map((item) => item.card);
}

function prettyCommunity(token: string): string {
  return (
    {
      women: "Women-owned",
      veteran: "Veteran",
      student: "Student",
      multicultural: "Multicultural",
      "new-american": "New American",
      rural: "Rural",
    }[token] ?? token
  );
}

function normalizeCommunity(value: string): string {
  const token = value.trim().toLowerCase();
  if (token === "women" || token === "woman-owned") return "women";
  if (token === "veteran") return "veteran";
  if (token === "student") return "student";
  if (token === "multicultural") return "multicultural";
  if (token === "new american") return "new-american";
  if (token === "any") return "any";
  return token;
}

export function communityMatches(persona: YouPersona, resourceCommunity: string): boolean {
  return persona.communities.map(normalizeCommunity).includes(normalizeCommunity(resourceCommunity));
}

export type { YouCommunity };
