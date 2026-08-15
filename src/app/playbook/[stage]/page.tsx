import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StepCardLink } from "@/components/catalog/step-card-link";
import { YouBar } from "@/components/catalog/you-bar";
import { YouParamLink } from "@/components/catalog/you-param-link";
import { playbookStage, stepsForStage } from "@/lib/catalog/playbook";
import type { PlaybookStageSlug } from "@/lib/catalog/types";

export function generateStaticParams() {
  return [
    { stage: "thinking-of-starting" },
    { stage: "starting" },
    { stage: "growing" },
    { stage: "closing" },
  ];
}

export default async function PlaybookStagePage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const { stage: slug } = await params;
  const stage = playbookStage(slug);
  if (!stage) notFound();
  const steps = stepsForStage(stage.slug as PlaybookStageSlug);
  return (
    <>
      <Suspense fallback={null}>
        <YouBar />
      </Suspense>
      <section
        className="relative isolate overflow-hidden border-b border-border"
        style={{ backgroundColor: `${stage.accent}10` }}
      >
        <div className="relative mx-auto max-w-[1200px] px-6 py-12 sm:py-16">
          <YouParamLink
            href="/playbook"
            className="mb-6 inline-flex text-xs text-foreground-muted hover:text-foreground"
          >
            ← Back to all stages
          </YouParamLink>
          <p className="eyebrow !mb-3" style={{ color: stage.accent }}>
            {stage.shortLabel} · {steps.length} step{steps.length === 1 ? "" : "s"}
          </p>
          <h1 className="h-display mb-4 text-4xl sm:text-5xl">{stage.label}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-foreground-muted">{stage.lead}</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1200px] px-6 py-12">
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li key={step.stepId}>
              <StepCardLink
                stageSlug={stage.slug}
                stepId={step.stepId}
                stepIndex={step.stepIndex}
                title={step.title}
                accent={stage.accent}
                previewText={step.summary}
              />
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
