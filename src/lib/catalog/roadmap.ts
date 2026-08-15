import { createHash } from "node:crypto";
import { PLAYBOOK_STEPS, stepsForStage } from "./playbook";
import { YOU_STAGE_SLUG, type YouPersona } from "./you-persona";
import type { PlaybookStageSlug, PlaybookStep } from "./types";

export type RoadmapAction = {
  text: string;
  href?: string;
  rationale?: string;
};

export type RoadmapWeek = {
  week: number;
  focus: string;
  actions: RoadmapAction[];
};

export type Roadmap = {
  summary: string;
  plan: RoadmapWeek[];
};

const WEEK_FOCUS: Record<YouPersona["stage"], [string, string, string, string]> = {
  Thinking: [
    "Test the idea in public",
    "Learn the rules of the road",
    "Find your first helpers",
    "Decide whether to file",
  ],
  Starting: [
    "Prove someone will pay",
    "Stand the company up",
    "Find the first dollars",
    "Keep the lights on",
  ],
  Growing: [
    "Fund the next twelve months",
    "Hire for the bottleneck",
    "Pick one growth channel",
    "Open a second door",
  ],
  Closing: [
    "Get the records straight",
    "Talk to the people who are owed",
    "File the official close",
    "Leave the door usable",
  ],
};

export function personaHash(persona: YouPersona): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        stage: persona.stage,
        sector: persona.sector,
        region: persona.region,
        communities: [...persona.communities].sort(),
        goal: persona.goal,
        revenue: persona.revenue,
      }),
    )
    .digest("hex")
    .slice(0, 16);
}

export function parseRoadmap(raw: unknown): Roadmap | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as { summary?: unknown; plan?: unknown };
  if (typeof body.summary !== "string" || !body.summary.trim()) return null;
  if (!Array.isArray(body.plan) || body.plan.length !== 4) return null;
  const plan: RoadmapWeek[] = [];
  for (let index = 0; index < 4; index += 1) {
    const week = body.plan[index] as {
      week?: unknown;
      focus?: unknown;
      actions?: unknown;
    };
    if (week.week !== index + 1) return null;
    if (typeof week.focus !== "string" || !week.focus.trim()) return null;
    if (!Array.isArray(week.actions) || week.actions.length < 2 || week.actions.length > 3) {
      return null;
    }
    const actions: RoadmapAction[] = [];
    for (const item of week.actions) {
      if (!item || typeof item !== "object") return null;
      const action = item as { text?: unknown; href?: unknown; rationale?: unknown };
      if (typeof action.text !== "string" || !action.text.trim()) return null;
      const parsed: RoadmapAction = { text: cleanCopy(action.text) };
      if (typeof action.href === "string" && action.href.startsWith("/playbook/")) {
        parsed.href = action.href;
      }
      if (typeof action.rationale === "string" && action.rationale.trim()) {
        parsed.rationale = cleanCopy(action.rationale);
      }
      actions.push(parsed);
    }
    plan.push({ week: index + 1, focus: cleanCopy(week.focus), actions });
  }
  return { summary: cleanCopy(body.summary), plan };
}

function cleanCopy(value: string): string {
  return value.replaceAll("—", "-").replaceAll("–", "-").trim();
}

export function fallbackRoadmap(persona: YouPersona): Roadmap {
  const slug = YOU_STAGE_SLUG[persona.stage];
  const steps = pickSteps(slug, persona);
  const focuses = WEEK_FOCUS[persona.stage];
  const plan: RoadmapWeek[] = focuses.map((focus, index) => {
    const slice = steps.slice(index * 2, index * 2 + 2);
    const extra = steps[8 + index];
    const used = extra ? [...slice, extra] : slice;
    return {
      week: index + 1,
      focus,
      actions: used.slice(0, 3).map((step) => actionFor(step, persona)),
    };
  });
  return {
    summary: summaryFor(persona),
    plan,
  };
}

function pickSteps(slug: PlaybookStageSlug, persona: YouPersona): PlaybookStep[] {
  const primary = stepsForStage(slug);
  const wanted = goalStepIds(persona);
  const ranked = [...primary].sort((left, right) => {
    const leftHit = wanted.has(left.stepId) ? 0 : 1;
    const rightHit = wanted.has(right.stepId) ? 0 : 1;
    return leftHit - rightHit || left.stepIndex - right.stepIndex;
  });
  if (ranked.length >= 8) return ranked;
  const rest = PLAYBOOK_STEPS.filter((step) => step.stage !== slug);
  return [...ranked, ...rest].slice(0, 8);
}

function goalStepIds(persona: YouPersona): Set<string> {
  if (persona.goal === "Find funding") return new Set(["growth-funding", "fund-small-business"]);
  if (persona.goal === "Hire") return new Set(["workforce"]);
  if (persona.goal === "Get first customers") {
    return new Set(["business-validation", "government-contracts-2"]);
  }
  if (persona.goal === "Expand internationally") return new Set(["international-trade-2"]);
  return new Set();
}

function actionFor(step: PlaybookStep, persona: YouPersona): RoadmapAction {
  return {
    text: `${step.title} for a ${persona.sector} company in ${persona.region}.`,
    href: `/playbook/${step.stage}/${step.stepId}`,
    rationale: step.summary,
  };
}

function summaryFor(persona: YouPersona): string {
  return `This month is for a ${persona.sector} company on the ${persona.region}, with ${persona.goal.toLowerCase()} as the job. ${persona.revenue} revenue is the constraint.`;
}
