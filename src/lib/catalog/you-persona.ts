import { FIXTURE_CHIPS } from "@/lib/copy";
import { parseLeftoverFixtureId } from "./leftover-test-case";
import type { PlaybookStageCard, PlaybookStageSlug } from "./types";
import type { FixtureId } from "@/lib/types/company-profile";

export const YOU_STORAGE_KEY = "startup_state.you";
export const YOU_CHANGED_EVENT = "you-persona-changed";

export const YOU_STAGES = ["Thinking", "Starting", "Growing", "Closing"] as const;
export type YouStage = (typeof YOU_STAGES)[number];

export const YOU_STAGE_LABEL: Record<YouStage, string> = {
  Thinking: "Thinking of starting",
  Starting: "Starting my business",
  Growing: "Growing my business",
  Closing: "Closing or selling",
};

export const YOU_STAGE_SLUG: Record<YouStage, PlaybookStageSlug> = {
  Thinking: "thinking-of-starting",
  Starting: "starting",
  Growing: "growing",
  Closing: "closing",
};

export const YOU_SECTORS = [
  "Software",
  "FinTech",
  "BioMedical",
  "Manufacturing",
  "Agriculture",
  "Consumer",
  "Energy",
  "Security",
  "Marketplaces",
  "Other",
] as const;
export type YouSector = (typeof YOU_SECTORS)[number];

export const YOU_REGIONS = ["Wasatch Front", "Northern Utah", "Southern Utah", "Rural"] as const;
export type YouRegion = (typeof YOU_REGIONS)[number];

export const YOU_COMMUNITIES = [
  "Woman-owned",
  "Veteran",
  "Student",
  "Multicultural",
  "New American",
] as const;
export type YouCommunity = (typeof YOU_COMMUNITIES)[number];

export const YOU_GOALS = [
  "Find funding",
  "Get first customers",
  "Hire",
  "Expand internationally",
  "Just exploring",
] as const;
export type YouGoal = (typeof YOU_GOALS)[number];

export const YOU_REVENUES = [
  "Pre-revenue",
  "<$1M",
  "$1M-$10M",
  "$10M-$100M",
  "$100M+",
  "Undisclosed",
] as const;
export type YouRevenue = (typeof YOU_REVENUES)[number];

export type YouPersona = {
  stage: YouStage;
  sector: YouSector;
  region: YouRegion;
  communities: YouCommunity[];
  goal: YouGoal;
  revenue: YouRevenue;
  fixtureId: FixtureId | null;
};

export const EMPTY_YOU_PERSONA: YouPersona = {
  stage: "Thinking",
  sector: "Other",
  region: "Wasatch Front",
  communities: [],
  goal: "Just exploring",
  revenue: "Pre-revenue",
  fixtureId: null,
};

export const FIXTURE_PERSONAS: Record<FixtureId, YouPersona> = {
  "fixture-1": {
    stage: "Growing",
    sector: "Software",
    region: "Wasatch Front",
    communities: [],
    goal: "Find funding",
    revenue: "$1M-$10M",
    fixtureId: "fixture-1",
  },
  "fixture-2": {
    stage: "Growing",
    sector: "Manufacturing",
    region: "Northern Utah",
    communities: [],
    goal: "Find funding",
    revenue: "$1M-$10M",
    fixtureId: "fixture-2",
  },
  "fixture-3": {
    stage: "Starting",
    sector: "Energy",
    region: "Wasatch Front",
    communities: [],
    goal: "Get first customers",
    revenue: "<$1M",
    fixtureId: "fixture-3",
  },
  "fixture-4": {
    stage: "Growing",
    sector: "Security",
    region: "Wasatch Front",
    communities: [],
    goal: "Find funding",
    revenue: "$1M-$10M",
    fixtureId: "fixture-4",
  },
  "fixture-5": {
    stage: "Starting",
    sector: "Marketplaces",
    region: "Wasatch Front",
    communities: [],
    goal: "Get first customers",
    revenue: "<$1M",
    fixtureId: "fixture-5",
  },
};

export function applyTestCase(id: FixtureId): YouPersona {
  return { ...FIXTURE_PERSONAS[id] };
}

export function personaToParams(persona: YouPersona): URLSearchParams {
  const params = new URLSearchParams();
  params.set("stage", persona.stage);
  params.set("sector", persona.sector);
  params.set("region", persona.region);
  params.set("goal", persona.goal);
  params.set("revenue", persona.revenue);
  for (const community of persona.communities) params.append("community", community);
  if (persona.fixtureId) params.set("fixture", persona.fixtureId);
  return params;
}

export function paramsToPersona(params: URLSearchParams): YouPersona {
  const stage = params.get("stage");
  const sector = params.get("sector");
  const region = params.get("region");
  const goal = params.get("goal");
  const revenue = params.get("revenue");
  const communities = params
    .getAll("community")
    .filter((item): item is YouCommunity => (YOU_COMMUNITIES as readonly string[]).includes(item));
  return {
    stage: YOU_STAGES.includes(stage as YouStage) ? (stage as YouStage) : EMPTY_YOU_PERSONA.stage,
    sector: YOU_SECTORS.includes(sector as YouSector)
      ? (sector as YouSector)
      : EMPTY_YOU_PERSONA.sector,
    region: YOU_REGIONS.includes(region as YouRegion)
      ? (region as YouRegion)
      : EMPTY_YOU_PERSONA.region,
    communities,
    goal: YOU_GOALS.includes(goal as YouGoal) ? (goal as YouGoal) : EMPTY_YOU_PERSONA.goal,
    revenue: YOU_REVENUES.includes(revenue as YouRevenue)
      ? (revenue as YouRevenue)
      : EMPTY_YOU_PERSONA.revenue,
    fixtureId: parseLeftoverFixtureId(params.get("fixture")),
  };
}

export function personaIsFilled(params: URLSearchParams): boolean {
  return params.has("stage");
}

export function withYouParams(href: string, params: URLSearchParams): string {
  const query = params.toString();
  if (!query) return href;
  return `${href}${href.includes("?") ? "&" : "?"}${query}`;
}

export function orderPlaybookStages(
  stages: PlaybookStageCard[],
  _persona: YouPersona | null,
): PlaybookStageCard[] {
  return stages;
}

export function youSummaryChips(persona: YouPersona): string[] {
  return [
    YOU_STAGE_LABEL[persona.stage],
    persona.sector,
    persona.region,
    ...persona.communities,
    persona.goal,
    persona.revenue,
  ];
}

export function parseStoredYouPersona(raw: string | null): YouPersona | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<YouPersona>;
    if (!parsed.stage || !YOU_STAGES.includes(parsed.stage)) return null;
    const fixtureId = parseLeftoverFixtureId(parsed.fixtureId ?? null);
    return {
      stage: parsed.stage,
      sector: YOU_SECTORS.includes(parsed.sector as YouSector)
        ? (parsed.sector as YouSector)
        : EMPTY_YOU_PERSONA.sector,
      region: YOU_REGIONS.includes(parsed.region as YouRegion)
        ? (parsed.region as YouRegion)
        : EMPTY_YOU_PERSONA.region,
      communities: (parsed.communities ?? []).filter((item): item is YouCommunity =>
        (YOU_COMMUNITIES as readonly string[]).includes(item),
      ),
      goal: YOU_GOALS.includes(parsed.goal as YouGoal)
        ? (parsed.goal as YouGoal)
        : EMPTY_YOU_PERSONA.goal,
      revenue: YOU_REVENUES.includes(parsed.revenue as YouRevenue)
        ? (parsed.revenue as YouRevenue)
        : EMPTY_YOU_PERSONA.revenue,
      fixtureId,
    };
  } catch {
    return null;
  }
}

export function youTestCaseChips(): { id: FixtureId; label: string }[] {
  return FIXTURE_CHIPS;
}
