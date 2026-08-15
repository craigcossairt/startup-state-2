import { Suspense } from "react";
import { PlaybookStageGrid } from "@/components/catalog/playbook-stage-grid";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { YouBar } from "@/components/catalog/you-bar";
import { PLAYBOOK_STEPS } from "@/lib/catalog/playbook";

export const metadata = {
  title: "Utah Startup Playbook",
  description: "Nineteen official GOEO steps for thinking, starting, growing, or closing a Utah company.",
};

export default function PlaybookPage() {
  return (
    <>
      <Suspense fallback={null}>
        <YouBar />
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
        <Suspense fallback={null}>
          <PlaybookStageGrid />
        </Suspense>
      </section>
    </>
  );
}
