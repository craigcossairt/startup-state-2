import { NextResponse } from "next/server";
import { callGrokJson, hasXaiKey } from "@/lib/grok/client";
import { loadCatalogResources } from "@/lib/catalog/load";
import { matchResources } from "@/lib/catalog/match-resources";
import { PLAYBOOK_STEPS } from "@/lib/catalog/playbook";
import {
  fallbackRoadmap,
  parseRoadmap,
  personaHash,
  type Roadmap,
} from "@/lib/catalog/roadmap";
import {
  EMPTY_YOU_PERSONA,
  YOU_COMMUNITIES,
  YOU_GOALS,
  YOU_REGIONS,
  YOU_REVENUES,
  YOU_SECTORS,
  YOU_STAGES,
  type YouPersona,
} from "@/lib/catalog/you-persona";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM = `You create a 4-week personalized roadmap for a Utah founder, grounded on GOED's resource catalog and Playbook step library.

Return JSON of the form:
{
  "summary": string,
  "plan": [
    { "week": 1, "focus": string, "actions": [{ "text": string, "href"?: string, "rationale"?: string }] },
    { "week": 2, "focus": string, "actions": [{ "text": string, "href"?: string, "rationale"?: string }] },
    { "week": 3, "focus": string, "actions": [{ "text": string, "href"?: string, "rationale"?: string }] },
    { "week": 4, "focus": string, "actions": [{ "text": string, "href"?: string, "rationale"?: string }] }
  ]
}

Rules:
- Exactly 4 weeks. Each week has 2-3 actions. Total 8-12 actions.
- Actions must be specific to this persona.
- Playbook actions must use href /playbook/<stage>/<step_id> from the library below.
- Name real GOED programs from the catalog. Do not invent programs. Do not write GOEO.
- Skip stages outside the user's lifecycle.
- Output JSON only.`;

function readPersona(body: unknown): YouPersona | null {
  if (!body || typeof body !== "object") return null;
  const persona = (body as { persona?: unknown }).persona;
  if (!persona || typeof persona !== "object") return null;
  const row = persona as Record<string, unknown>;
  if (!YOU_STAGES.includes(row.stage as YouPersona["stage"])) return null;
  return {
    stage: row.stage as YouPersona["stage"],
    sector: YOU_SECTORS.includes(row.sector as YouPersona["sector"])
      ? (row.sector as YouPersona["sector"])
      : EMPTY_YOU_PERSONA.sector,
    region: YOU_REGIONS.includes(row.region as YouPersona["region"])
      ? (row.region as YouPersona["region"])
      : EMPTY_YOU_PERSONA.region,
    communities: Array.isArray(row.communities)
      ? row.communities.filter((item): item is YouPersona["communities"][number] =>
          (YOU_COMMUNITIES as readonly string[]).includes(String(item)),
        )
      : [],
    goal: YOU_GOALS.includes(row.goal as YouPersona["goal"])
      ? (row.goal as YouPersona["goal"])
      : EMPTY_YOU_PERSONA.goal,
    revenue: YOU_REVENUES.includes(row.revenue as YouPersona["revenue"])
      ? (row.revenue as YouPersona["revenue"])
      : EMPTY_YOU_PERSONA.revenue,
    fixtureId: null,
  };
}

export async function POST(req: Request) {
  let persona: YouPersona;
  try {
    const parsed = readPersona(await req.json());
    if (!parsed) {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }
    persona = parsed;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hash = personaHash(persona);
  const fallback = fallbackRoadmap(persona);
  if (!hasXaiKey()) {
    return NextResponse.json({ ...fallback, personaHash: hash, fromCache: false });
  }

  try {
    const resources = await loadCatalogResources();
    const matched = matchResources(persona, resources)
      .slice(0, 50)
      .map((row) => row.resource);
    const payload = await callGrokJson({
      reasoningEffort: "low",
      system: SYSTEM,
      user: `Persona:
Stage: ${persona.stage} · Sector: ${persona.sector} · Region: ${persona.region} · Communities: ${
        persona.communities.join(", ") || "(none)"
      } · Goal: ${persona.goal} · Revenue: ${persona.revenue}

Top GOED programs:
${matched
  .map(
    (row, index) =>
      `${index + 1}. ${row.title} — ${(row.description ?? "").slice(0, 160)} (topics: ${
        row.topics.join(", ") || "—"
      })`,
  )
  .join("\n")}

Playbook step library:
${PLAYBOOK_STEPS.map((step) => `- ${step.stage}/${step.stepId} — ${step.title}`).join("\n")}

Produce the JSON roadmap.`,
    });
    const roadmap = parseRoadmap(payload);
    const body: Roadmap = roadmap ?? fallback;
    return NextResponse.json({ ...body, personaHash: hash, fromCache: false });
  } catch {
    return NextResponse.json({ ...fallback, personaHash: hash, fromCache: false });
  }
}
