import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LeftoverTestCaseBar } from "@/components/catalog/leftover-test-case-bar";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { parseLeftoverFixtureId, withLeftoverFixture } from "@/lib/catalog/leftover-test-case";
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
  searchParams,
}: {
  params: Promise<{ stage: string }>;
  searchParams: Promise<{ fixture?: string }>;
}) {
  const { stage: slug } = await params;
  const fixture = parseLeftoverFixtureId((await searchParams).fixture);
  const stage = playbookStage(slug);
  if (!stage) notFound();
  const steps = stepsForStage(stage.slug as PlaybookStageSlug);
  return (
    <>
      <Suspense fallback={null}>
        <LeftoverTestCaseBar />
      </Suspense>
      <SurfaceHero eyebrow="Utah Startup Playbook" title={stage.label}>
        <p>{stage.lead}</p>
      </SurfaceHero>
      <section className="mx-auto max-w-[1200px] px-6 py-12">
        <p className="mb-6 text-sm">
          <Link
            href={withLeftoverFixture("/playbook", fixture)}
            className="font-semibold text-primary hover:underline"
          >
            All stages
          </Link>
        </p>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {steps.map((step) => (
            <li key={step.stepId}>
              <Link
                href={withLeftoverFixture(`/playbook/${stage.slug}/${step.stepId}`, fixture)}
                className="block h-full rounded-xl border border-border bg-white p-5 hover:border-primary/40"
              >
                <p className="text-xs font-semibold text-foreground-muted">Step {step.stepIndex}</p>
                <h2 className="mt-1 font-display text-lg font-extrabold tracking-tight">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{step.summary}</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
