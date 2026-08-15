"use client";

import { StageCardLink } from "@/components/catalog/stage-card-link";
import { PLAYBOOK_STAGES, stepCountByStage } from "@/lib/catalog/playbook";
import {
  orderPlaybookStages,
  paramsToPersona,
  personaIsFilled,
  YOU_STAGE_SLUG,
} from "@/lib/catalog/you-persona";
import { useSearchParams } from "next/navigation";

export function PlaybookStageGrid() {
  const params = useSearchParams();
  const filled = personaIsFilled(params);
  const persona = filled ? paramsToPersona(params) : null;
  const stages = orderPlaybookStages(PLAYBOOK_STAGES, persona);
  const counts = stepCountByStage();
  const yours = persona ? YOU_STAGE_SLUG[persona.stage] : null;

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => (
        <li key={stage.slug}>
          <StageCardLink
            slug={stage.slug}
            label={stage.label}
            shortLabel={stage.shortLabel}
            accent={stage.accent}
            stepCount={counts[stage.slug]}
            yours={yours === stage.slug}
          />
        </li>
      ))}
    </ul>
  );
}
