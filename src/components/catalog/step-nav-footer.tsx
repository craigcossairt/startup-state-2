"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function StepNavFooter({
  stageSlug,
  stageLabel,
  prevStep,
  nextStep,
}: {
  stageSlug: string;
  stageLabel: string;
  prevStep: { stepId: string; title: string } | null;
  nextStep: { stepId: string; title: string } | null;
}) {
  const params = useSearchParams();
  const qs = params.toString() ? `?${params.toString()}` : "";

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-[860px] grid-cols-1 gap-3 px-6 py-10 sm:grid-cols-2">
        {prevStep ? (
          <Link
            href={`/playbook/${stageSlug}/${prevStep.stepId}${qs}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-primary/40 hover:bg-background-alt"
          >
            <span aria-hidden className="text-foreground-muted">
              ←
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
                Previous step
              </p>
              <p className="truncate font-semibold group-hover:text-primary">{prevStep.title}</p>
            </div>
          </Link>
        ) : (
          <Link
            href={`/playbook/${stageSlug}${qs}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-primary/40 hover:bg-background-alt"
          >
            <span aria-hidden className="text-foreground-muted">
              ←
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
                Back to
              </p>
              <p className="truncate font-semibold group-hover:text-primary">{stageLabel}</p>
            </div>
          </Link>
        )}

        {nextStep ? (
          <Link
            href={`/playbook/${stageSlug}/${nextStep.stepId}${qs}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-primary/40 hover:bg-background-alt sm:text-right"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
                Next step
              </p>
              <p className="truncate font-semibold group-hover:text-primary">{nextStep.title}</p>
            </div>
            <span aria-hidden className="text-foreground-muted">
              →
            </span>
          </Link>
        ) : (
          <Link
            href={`/playbook${qs}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-primary/40 hover:bg-background-alt sm:text-right"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
                Back to
              </p>
              <p className="truncate font-semibold group-hover:text-primary">Playbook home</p>
            </div>
            <span aria-hidden className="text-foreground-muted">
              →
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
