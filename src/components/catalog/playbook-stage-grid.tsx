"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PLAYBOOK_STAGES, stepCountByStage } from "@/lib/catalog/playbook";
import {
  orderPlaybookStages,
  paramsToPersona,
  personaIsFilled,
  YOU_STAGE_SLUG,
} from "@/lib/catalog/you-persona";

export function PlaybookStageGrid() {
  const params = useSearchParams();
  const filled = personaIsFilled(params);
  const persona = filled ? paramsToPersona(params) : null;
  const stages = orderPlaybookStages(PLAYBOOK_STAGES, persona);
  const counts = stepCountByStage();
  const query = params.toString();
  const yours = persona ? YOU_STAGE_SLUG[persona.stage] : null;

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => (
        <li key={stage.slug}>
          <Link
            href={query ? `/playbook/${stage.slug}?${query}` : `/playbook/${stage.slug}`}
            className={`block h-full rounded-2xl border bg-white p-5 hover:border-primary/40 hover:shadow-md ${
              yours === stage.slug ? "border-primary" : "border-border"
            }`}
          >
            <span
              className="mb-4 block h-1.5 w-12 rounded-full"
              style={{ background: stage.accent }}
            />
            <h3 className="font-display text-xl font-extrabold tracking-tight">{stage.shortLabel}</h3>
            <p className="mt-1 text-sm text-foreground-muted">{stage.label}</p>
            {yours === stage.slug ? (
              <p className="mt-2 text-xs font-semibold text-primary">Your stage</p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed">{stage.lead}</p>
            <p className="mt-4 text-xs font-semibold text-primary">{counts[stage.slug]} steps</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
