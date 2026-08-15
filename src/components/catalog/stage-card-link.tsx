"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePlaybookProgress } from "@/lib/catalog/playbook-progress";

export function StageCardLink({
  slug,
  label,
  shortLabel,
  accent,
  stepCount,
  yours,
}: {
  slug: string;
  label: string;
  shortLabel: string;
  accent: string;
  stepCount: number;
  yours?: boolean;
}) {
  const params = useSearchParams();
  const { completedInStage } = usePlaybookProgress();
  const done = completedInStage(slug);
  const href = params.toString() ? `/playbook/${slug}?${params.toString()}` : `/playbook/${slug}`;
  const allDone = stepCount > 0 && done >= stepCount;

  return (
    <Link
      href={href}
      className={`group block h-full rounded-2xl border bg-white p-6 transition-all hover:border-primary/40 hover:shadow-md ${
        yours ? "border-primary" : "border-border"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          {shortLabel}
        </span>
        {allDone ? (
          <span className="text-[11px] font-semibold text-primary">Complete</span>
        ) : yours ? (
          <span className="text-[11px] font-semibold text-primary">Your stage</span>
        ) : null}
      </div>
      <h3 className="mb-2 font-display text-xl font-extrabold leading-tight tracking-tight">
        {label}
      </h3>
      <p className="text-xs text-foreground-muted">
        {stepCount > 0 ? (
          <>
            {stepCount} step{stepCount === 1 ? "" : "s"}
            {done > 0 ? <span className="text-primary"> · {done} done</span> : null}
          </>
        ) : (
          "Coming soon"
        )}
      </p>
      <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
        Open
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
