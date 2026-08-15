"use client";

import { useEffect } from "react";
import { usePlaybookProgress } from "@/lib/catalog/playbook-progress";

export function StepCompleteToggle({
  stageSlug,
  stepId,
}: {
  stageSlug: string;
  stepId: string;
}) {
  const { isDone, setDone, visit } = usePlaybookProgress();
  const done = isDone(stageSlug, stepId);

  useEffect(() => {
    visit(stageSlug, stepId);
  }, [stageSlug, stepId, visit]);

  return (
    <button
      type="button"
      onClick={() => setDone(stageSlug, stepId, !done)}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
        done
          ? "bg-primary text-white hover:bg-primary/90"
          : "bg-background-alt text-foreground-muted hover:bg-foreground-muted/15 hover:text-foreground"
      }`}
      aria-pressed={done}
    >
      {done ? "Done" : "Mark as done"}
    </button>
  );
}
