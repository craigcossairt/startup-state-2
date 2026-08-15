"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePlaybookProgress } from "@/lib/catalog/playbook-progress";

export function ResumeBanner() {
  const { state, totalCompleted } = usePlaybookProgress();
  const params = useSearchParams();

  if (!state.lastVisitedStepId) return null;

  const href = `/playbook/${state.lastVisitedStepId}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  return (
    <Link
      href={href}
      className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition-colors hover:bg-white/10"
    >
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-bright-green">Resume</span>
      <span className="text-sm text-white/90">Pick up where you left off</span>
      {totalCompleted > 0 ? (
        <span className="text-xs text-white/60">
          ({totalCompleted} step{totalCompleted === 1 ? "" : "s"} done)
        </span>
      ) : null}
      <span aria-hidden className="ml-1 text-white/70">
        →
      </span>
    </Link>
  );
}
