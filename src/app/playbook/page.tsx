import Link from "next/link";
import { Suspense } from "react";
import { LeftoverTestCaseBar } from "@/components/catalog/leftover-test-case-bar";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { parseLeftoverFixtureId, withLeftoverFixture } from "@/lib/catalog/leftover-test-case";
import { PLAYBOOK_STAGES, PLAYBOOK_STEPS, stepCountByStage } from "@/lib/catalog/playbook";

export const metadata = {
  title: "Utah Startup Playbook",
  description: "Nineteen official GOEO steps for thinking, starting, growing, or closing a Utah company.",
};

export default async function PlaybookPage({
  searchParams,
}: {
  searchParams: Promise<{ fixture?: string }>;
}) {
  const fixture = parseLeftoverFixtureId((await searchParams).fixture);
  const counts = stepCountByStage();
  return (
    <>
      <Suspense fallback={null}>
        <LeftoverTestCaseBar />
      </Suspense>
      <SurfaceHero
        eyebrow="The Utah Startup Playbook"
        title={
          <>
            <span className="serif-italic text-bright-green">{PLAYBOOK_STEPS.length}</span> steps,
            written for the journey you are on.
          </>
        }
      >
        <p>
          GOEO published four lifecycle stages and {PLAYBOOK_STEPS.length} concrete steps. Pick
          where you are. Each step links to the official startup.utah.gov page and to matching
          GOEO programs. Ask the Navigator if you want a next step in plain language.
        </p>
      </SurfaceHero>
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <p className="eyebrow !mb-3">Choose your stage</p>
        <h2 className="h-display mb-10 max-w-2xl text-3xl sm:text-4xl">
          Where are you on your <span className="serif-italic text-primary">path?</span>
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLAYBOOK_STAGES.map((stage) => (
            <li key={stage.slug}>
              <Link
                href={withLeftoverFixture(`/playbook/${stage.slug}`, fixture)}
                className="block h-full rounded-2xl border border-border bg-white p-5 hover:border-primary/40 hover:shadow-md"
              >
                <span
                  className="mb-4 block h-1.5 w-12 rounded-full"
                  style={{ background: stage.accent }}
                />
                <h3 className="font-display text-xl font-extrabold tracking-tight">{stage.shortLabel}</h3>
                <p className="mt-1 text-sm text-foreground-muted">{stage.label}</p>
                <p className="mt-3 text-sm leading-relaxed">{stage.lead}</p>
                <p className="mt-4 text-xs font-semibold text-primary">
                  {counts[stage.slug]} steps
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
