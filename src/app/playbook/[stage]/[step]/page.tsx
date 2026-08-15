import Link from "next/link";
import { notFound } from "next/navigation";
import { SurfaceHero } from "@/components/catalog/surface-hero";
import { loadCatalogResources } from "@/lib/catalog/load";
import { resourcesForStep } from "@/lib/catalog/filter";
import { PLAYBOOK_STEPS, playbookStage, playbookStep } from "@/lib/catalog/playbook";

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
  return (
    <>
      <SurfaceHero eyebrow={stage.label} title={step.title}>
        <p>{step.summary}</p>
      </SurfaceHero>
      <section className="mx-auto max-w-[1200px] space-y-10 px-6 py-12">
        <p className="text-sm">
          <Link href={`/playbook/${stage.slug}`} className="font-semibold text-primary hover:underline">
            {stage.label}
          </Link>
        </p>
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
            <h2 className="h-display text-2xl">Matching GOEO programs</h2>
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
    </>
  );
}
