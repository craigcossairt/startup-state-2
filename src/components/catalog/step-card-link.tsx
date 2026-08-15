"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePlaybookProgress } from "@/lib/catalog/playbook-progress";

export function StepCardLink({
  stageSlug,
  stepId,
  stepIndex,
  title,
  accent,
  previewText,
}: {
  stageSlug: string;
  stepId: string;
  stepIndex: number;
  title: string;
  accent: string;
  previewText: string;
}) {
  const params = useSearchParams();
  const { isDone } = usePlaybookProgress();
  const done = isDone(stageSlug, stepId);
  const href = params.toString()
    ? `/playbook/${stageSlug}/${stepId}?${params.toString()}`
    : `/playbook/${stageSlug}/${stepId}`;
  const preview = previewText.replace(/^#{1,6}\s+/g, "").replace(/^[-*]\s+/g, "").replace(/\*\*/g, "").slice(0, 110);

  return (
    <Link
      href={href}
      className="group block h-full rounded-xl border border-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span
          className="text-[10px] font-extrabold tracking-widest tabular-nums"
          style={{ color: accent }}
        >
          STEP {stepIndex.toString().padStart(2, "0")}
        </span>
        {done ? (
          <span className="text-[11px] font-semibold text-primary">Done</span>
        ) : (
          <span aria-hidden className="text-foreground-muted group-hover:text-primary">
            →
          </span>
        )}
      </div>
      <h3 className="mb-2 font-display text-lg font-extrabold leading-tight">{title}</h3>
      <p className="line-clamp-3 text-sm leading-snug text-foreground-muted">
        {preview}
        {previewText.length > 110 ? "…" : ""}
      </p>
    </Link>
  );
}
