import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StepCompleteToggle } from "@/components/catalog/step-complete-toggle";
import { StepNavFooter } from "@/components/catalog/step-nav-footer";
import { YouBar } from "@/components/catalog/you-bar";
import { YouParamLink } from "@/components/catalog/you-param-link";
import { loadCatalogResources } from "@/lib/catalog/load";
import { resourcesForStep } from "@/lib/catalog/filter";
import {
  adjacentPlaybookSteps,
  PLAYBOOK_STEPS,
  playbookStage,
  playbookStep,
  stepsForStage,
} from "@/lib/catalog/playbook";

export function generateStaticParams() {
  return PLAYBOOK_STEPS.map((step) => ({ stage: step.stage, step: step.stepId }));
}

export default async function PlaybookStepPage({
  params,
}: {
  params: Promise<{ stage: string; step: string }>;
}) {
  const { stage: stageSlug, step: stepId } = await params;
  const stage = playbookStage(stageSlug);
  const step = playbookStep(stageSlug, stepId);
  if (!stage || !step) notFound();
  const related = resourcesForStep(step, await loadCatalogResources());
  const neighbors = adjacentPlaybookSteps(stage.slug, step.stepId);
  const stageSteps = stepsForStage(stage.slug);

  return (
    <>
      <Suspense fallback={null}>
        <YouBar />
      </Suspense>
      <section
        className="relative isolate overflow-hidden border-b border-border"
        style={{ backgroundColor: `${stage.accent}10` }}
      >
        <div className="relative mx-auto max-w-[860px] px-6 py-12 sm:py-16">
          <p className="mb-5 text-xs text-foreground-muted">
            <YouParamLink href="/playbook" className="hover:text-foreground">
              Playbook
            </YouParamLink>
            <span className="px-1">›</span>
            <YouParamLink href={`/playbook/${stage.slug}`} className="hover:text-foreground">
              {stage.label}
            </YouParamLink>
          </p>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-4">
            <p className="eyebrow !mb-0" style={{ color: stage.accent }}>
              Step {step.stepIndex.toString().padStart(2, "0")} of {stageSteps.length}
            </p>
            <Suspense fallback={null}>
              <StepCompleteToggle stageSlug={stage.slug} stepId={step.stepId} />
            </Suspense>
          </div>
          <h1 className="h-display text-4xl leading-tight sm:text-5xl">{step.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground-muted">
            {step.summary}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[860px] space-y-10 px-6 py-12">
        <div>
          <h2 className="h-display text-2xl">What you do</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            {step.whatYouDo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="h-display text-2xl">Official links</h2>
          <ul className="mt-4 space-y-2 text-sm font-semibold">
            {step.officialLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target={link.url.startsWith("/") ? undefined : "_blank"}
                  rel={link.url.startsWith("/") ? undefined : "noopener noreferrer"}
                  className="text-primary hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {related.length > 0 ? (
          <div>
            <h2 className="h-display text-2xl">Matching GOED programs</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {related.map((row) => (
                <li key={row.id} className="rounded-xl border border-border p-4">
                  <p className="font-display font-extrabold">{row.title}</p>
                  {row.link ? (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                    >
                      Official site
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
      <Suspense fallback={null}>
        <StepNavFooter
          stageSlug={stage.slug}
          stageLabel={stage.label}
          prevStep={neighbors.prev}
          nextStep={neighbors.next}
        />
      </Suspense>
    </>
  );
}
