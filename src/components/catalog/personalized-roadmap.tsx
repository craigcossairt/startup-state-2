"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  paramsToPersona,
  personaIsFilled,
  YOU_STORAGE_KEY,
} from "@/lib/catalog/you-persona";
import type { Roadmap } from "@/lib/catalog/roadmap";

const PROGRESS_KEY_PREFIX = "startup_state.roadmap_progress.";

function loadProgress(hash: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY_PREFIX + hash);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveProgress(hash: string, ids: Set<string>) {
  window.localStorage.setItem(PROGRESS_KEY_PREFIX + hash, JSON.stringify([...ids]));
}

export function PersonalizedRoadmap() {
  const params = useSearchParams();
  const filledInUrl = personaIsFilled(params);
  const [hasPersona, setHasPersona] = useState(filledInUrl);
  const persona = paramsToPersona(params);
  const [state, setState] = useState<
    | { phase: "idle" }
    | { phase: "loading" }
    | { phase: "ready"; roadmap: Roadmap & { personaHash: string }; done: Set<string> }
    | { phase: "error" }
  >({ phase: "idle" });

  useEffect(() => {
    if (filledInUrl) {
      setHasPersona(true);
      return;
    }
    setHasPersona(Boolean(window.localStorage.getItem(YOU_STORAGE_KEY)));
  }, [filledInUrl]);

  const personaSig = `${persona.stage}|${persona.sector}|${persona.region}|${[
    ...persona.communities,
  ]
    .sort()
    .join(",")}|${persona.goal}|${persona.revenue}`;

  useEffect(() => {
    if (!hasPersona) {
      setState({ phase: "idle" });
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setState({ phase: "loading" });
    fetch("/api/playbook/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Roadmap & { personaHash: string }>;
      })
      .then((roadmap) => {
        if (cancelled) return;
        setState({ phase: "ready", roadmap, done: loadProgress(roadmap.personaHash) });
      })
      .catch((error: Error) => {
        if (cancelled || error.name === "AbortError") return;
        setState({ phase: "error" });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [personaSig, hasPersona]);

  if (!hasPersona) return null;

  const toggle = (key: string) => {
    if (state.phase !== "ready") return;
    const next = new Set(state.done);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    saveProgress(state.roadmap.personaHash, next);
    setState({ ...state, done: next });
  };

  return (
    <section className="border-t border-border bg-background-alt">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <p className="eyebrow !mb-0 !text-primary">Your personalized roadmap</p>
        <h2 className="h-display mt-2 mb-2 max-w-3xl text-3xl sm:text-4xl">
          A four-week plan, <span className="serif-italic text-primary">written for you.</span>
        </h2>
        {state.phase === "loading" ? <RoadmapSkeleton /> : null}
        {state.phase === "error" ? (
          <p className="mt-4 text-sm text-foreground-muted">
            We could not generate your plan right now. Try again in a moment.
          </p>
        ) : null}
        {state.phase === "ready" ? (
          <RoadmapView roadmap={state.roadmap} done={state.done} onToggle={toggle} />
        ) : null}
      </div>
    </section>
  );
}

function RoadmapSkeleton() {
  return (
    <>
      <div className="mt-4 mb-8 h-4 w-2/3 animate-pulse rounded bg-foreground-muted/15" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-xl border border-border bg-background p-5">
            <div className="mb-3 h-3 w-16 animate-pulse rounded bg-foreground-muted/15" />
            <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-foreground-muted/15" />
            <div className="space-y-2">
              {[0, 1, 2].map((line) => (
                <div key={line} className="h-3 w-full animate-pulse rounded bg-foreground-muted/10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RoadmapView({
  roadmap,
  done,
  onToggle,
}: {
  roadmap: Roadmap;
  done: Set<string>;
  onToggle: (key: string) => void;
}) {
  const total = roadmap.plan.reduce((count, week) => count + week.actions.length, 0);
  const doneCount = roadmap.plan.reduce(
    (count, week) =>
      count + week.actions.filter((action) => done.has(`${week.week}::${action.text}`)).length,
    0,
  );
  return (
    <>
      <p className="mb-6 max-w-3xl text-base leading-relaxed text-foreground-muted sm:text-lg">
        {roadmap.summary}
      </p>
      <div className="mb-8 flex items-center gap-3 text-sm">
        <div className="h-2 max-w-md flex-1 overflow-hidden rounded-full bg-foreground-muted/10">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${total === 0 ? 0 : Math.round((doneCount / total) * 100)}%` }}
          />
        </div>
        <span className="tabular-nums text-xs text-foreground-muted">
          {doneCount} / {total} done
        </span>
      </div>
      <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roadmap.plan.map((week) => (
          <li key={week.week} className="rounded-xl border border-border bg-background p-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
              Week {week.week}
            </p>
            <h3 className="mb-4 font-display text-base font-extrabold leading-tight tracking-tight">
              {week.focus}
            </h3>
            <ul className="space-y-2.5">
              {week.actions.map((action) => {
                const key = `${week.week}::${action.text}`;
                const isDone = done.has(key);
                return (
                  <li key={key}>
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onToggle(key)}
                        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                          isDone
                            ? "border-primary bg-primary text-white"
                            : "border-border hover:border-foreground-muted"
                        }`}
                        aria-label={isDone ? "Mark not done" : "Mark done"}
                      >
                        {isDone ? "✓" : ""}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-sm leading-snug ${isDone ? "text-foreground-muted line-through" : ""}`}>
                          {action.text}
                        </p>
                        {action.rationale ? (
                          <p className="mt-1 text-xs leading-snug text-foreground-muted italic">
                            {action.rationale}
                          </p>
                        ) : null}
                        {action.href ? (
                          <Link
                            href={action.href}
                            className="mt-1 inline-flex items-center text-xs font-semibold text-primary hover:underline"
                          >
                            Open this step
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}
