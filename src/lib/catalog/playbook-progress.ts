"use client";

import * as React from "react";

export const PLAYBOOK_PROGRESS_KEY = "startup_state.playbook_progress";

export type PlaybookProgress = {
  completedStepIds: string[];
  lastVisitedStepId?: string;
  lastUpdated: number;
};

export function emptyPlaybookProgress(): PlaybookProgress {
  return { completedStepIds: [], lastUpdated: 0 };
}

export function playbookStepKey(stageSlug: string, stepId: string): string {
  return `${stageSlug}/${stepId}`;
}

export function parsePlaybookProgress(raw: string | null): PlaybookProgress {
  if (!raw) return emptyPlaybookProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<PlaybookProgress>;
    return {
      completedStepIds: Array.isArray(parsed.completedStepIds)
        ? parsed.completedStepIds.filter((item) => typeof item === "string")
        : [],
      lastVisitedStepId:
        typeof parsed.lastVisitedStepId === "string" ? parsed.lastVisitedStepId : undefined,
      lastUpdated: typeof parsed.lastUpdated === "number" ? parsed.lastUpdated : 0,
    };
  } catch {
    return emptyPlaybookProgress();
  }
}

export function applySetDone(
  progress: PlaybookProgress,
  stageSlug: string,
  stepId: string,
  done: boolean,
): PlaybookProgress {
  const key = playbookStepKey(stageSlug, stepId);
  return {
    ...progress,
    completedStepIds: done
      ? progress.completedStepIds.includes(key)
        ? progress.completedStepIds
        : [...progress.completedStepIds, key]
      : progress.completedStepIds.filter((item) => item !== key),
    lastUpdated: Date.now(),
  };
}

export function applyVisit(
  progress: PlaybookProgress,
  stageSlug: string,
  stepId: string,
): PlaybookProgress {
  const key = playbookStepKey(stageSlug, stepId);
  if (progress.lastVisitedStepId === key) return progress;
  return { ...progress, lastVisitedStepId: key, lastUpdated: Date.now() };
}

export function completedInStage(progress: PlaybookProgress, stageSlug: string): number {
  return progress.completedStepIds.filter((item) => item.startsWith(`${stageSlug}/`)).length;
}

function load(): PlaybookProgress {
  if (typeof window === "undefined") return emptyPlaybookProgress();
  return parsePlaybookProgress(window.localStorage.getItem(PLAYBOOK_PROGRESS_KEY));
}

function save(progress: PlaybookProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PLAYBOOK_PROGRESS_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent("playbook-progress-change"));
  } catch {
    /* localStorage may be disabled */
  }
}

export function usePlaybookProgress() {
  const [state, setState] = React.useState<PlaybookProgress>(emptyPlaybookProgress());

  React.useEffect(() => {
    setState(load());
    const onChange = () => setState(load());
    window.addEventListener("playbook-progress-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("playbook-progress-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isDone = React.useCallback(
    (stageSlug: string, stepId: string) =>
      state.completedStepIds.includes(playbookStepKey(stageSlug, stepId)),
    [state.completedStepIds],
  );

  const setDone = React.useCallback((stageSlug: string, stepId: string, done: boolean) => {
    save(applySetDone(load(), stageSlug, stepId, done));
  }, []);

  const visit = React.useCallback((stageSlug: string, stepId: string) => {
    save(applyVisit(load(), stageSlug, stepId));
  }, []);

  const completedForStage = React.useCallback(
    (stageSlug: string) => completedInStage(state, stageSlug),
    [state],
  );

  return {
    state,
    isDone,
    setDone,
    visit,
    totalCompleted: state.completedStepIds.length,
    completedInStage: completedForStage,
  };
}
