"use client";

import { useEffect, useState } from "react";
import { BonusPage } from "@/components/bonus-page";
import { fundingPlan, type PlanItem } from "@/lib/bonus/plan";

const PLAN_PROGRESS_KEY = "ss2-plan-progress";

function loadDone(): Set<string> {
  try {
    const raw = localStorage.getItem(PLAN_PROGRESS_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function saveDone(ids: Set<string>) {
  localStorage.setItem(PLAN_PROGRESS_KEY, JSON.stringify([...ids]));
}

export default function PlanPage() {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDone(loadDone());
  }, []);

  function toggle(item: PlanItem) {
    const next = new Set(done);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    setDone(next);
    saveDone(next);
  }

  return (
    <BonusPage title="Your plan" active="/map/plan">
      {(payload) => {
        const weeks = fundingPlan(payload.cards);
        if (weeks.length === 0) {
          return <p>No dated or standing cards on this map fall in the next 12 months.</p>;
        }
        return (
          <div className="space-y-8">
            <p className="text-foreground-muted">
              A sequence from this map. Check off a step when you have opened the official page.
            </p>
            {weeks.map((week) => (
              <section key={week.title}>
                <p className="eyebrow">{week.title}</p>
                <ul className="mt-3 space-y-3">
                  {week.items.map((item) => {
                    const checked = done.has(item.id);
                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 rounded-lg border border-border bg-white p-4"
                      >
                        <button
                          type="button"
                          aria-pressed={checked}
                          aria-label={checked ? `Done: ${item.program}` : `Mark done: ${item.program}`}
                          onClick={() => toggle(item)}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 text-sm font-bold ${
                            checked
                              ? "border-vibrant-green bg-vibrant-green text-white"
                              : "border-midnight bg-white text-transparent"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </button>
                        <div>
                          <p className={`font-extrabold ${checked ? "text-foreground-muted line-through" : ""}`}>
                            {item.program}
                          </p>
                          <p className="text-sm text-foreground-muted">
                            {item.when ?? "Standing"} · {item.label}
                          </p>
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-sm font-semibold text-vibrant-green"
                            >
                              Open the official page
                            </a>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        );
      }}
    </BonusPage>
  );
}
