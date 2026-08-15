"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FIXTURE_CHIPS, TEST_CASES_LABEL } from "@/lib/copy";
import {
  applyTestCase,
  EMPTY_YOU_PERSONA,
  paramsToPersona,
  parseStoredYouPersona,
  personaIsFilled,
  personaToParams,
  YOU_CHANGED_EVENT,
  YOU_COMMUNITIES,
  YOU_GOALS,
  YOU_REGIONS,
  YOU_REVENUES,
  YOU_SECTORS,
  YOU_STAGE_LABEL,
  YOU_STAGES,
  YOU_STORAGE_KEY,
  youSummaryChips,
  type YouCommunity,
  type YouPersona,
} from "@/lib/catalog/you-persona";

export function YouBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = paramsToPersona(searchParams);
  const filledInUrl = personaIsFilled(searchParams);
  const [filled, setFilled] = useState(filledInUrl);
  const [persona, setPersona] = useState<YouPersona>(fromUrl);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (filledInUrl) {
      saveYouPersona(fromUrl);
      setFilled(true);
      setPersona(fromUrl);
      return;
    }
    const stored = parseStoredYouPersona(window.localStorage.getItem(YOU_STORAGE_KEY));
    if (!stored) return;
    setPersona(stored);
    setFilled(true);
    router.replace(`${pathname}?${personaToParams(stored).toString()}`, { scroll: false });
  }, []);

  useEffect(() => {
    if (!personaIsFilled(searchParams)) return;
    const next = paramsToPersona(searchParams);
    setPersona(next);
    setFilled(true);
    saveYouPersona(next);
  }, [searchParams]);

  const commit = (next: YouPersona) => {
    setPersona(next);
    setFilled(true);
    saveYouPersona(next);
    router.replace(`${pathname}?${personaToParams(next).toString()}`, { scroll: false });
  };

  const reset = () => {
    setFilled(false);
    setPersona(EMPTY_YOU_PERSONA);
    setOpen(false);
    window.localStorage.removeItem(YOU_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(YOU_CHANGED_EVENT));
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="sticky top-14 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6">
        {filled ? (
          <FilledSummary
            persona={persona}
            open={open}
            onToggle={() => setOpen((value) => !value)}
            onReset={reset}
          />
        ) : (
          <form
            className={`flex w-full items-center gap-2 sm:gap-3 ${
              !open && !draft.trim() ? "persona-bar-breathing" : ""
            }`}
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
          >
            <Image
              src="/brand/startup-state-mark.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 opacity-80"
            />
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tell us about your business to get a personalized action plan"
              className="h-8 min-w-0 flex-1 bg-transparent text-sm placeholder:text-foreground-muted/70 focus:outline-none"
            />
            {draft.trim().length > 3 ? (
              <button
                type="submit"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90"
              >
                Personalize
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-background-alt px-2.5 text-xs text-foreground-muted hover:text-foreground"
              >
                Open form
              </button>
            )}
          </form>
        )}
      </div>
      {open ? (
        <div className="border-t border-border bg-background-alt">
          <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
            <PersonaForm
              persona={persona}
              onCommit={(next) => {
                commit(next);
                setOpen(false);
              }}
              onCancel={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function saveYouPersona(persona: YouPersona) {
  window.localStorage.setItem(YOU_STORAGE_KEY, JSON.stringify(persona));
  window.dispatchEvent(new CustomEvent(YOU_CHANGED_EVENT));
}

function FilledSummary({
  persona,
  open,
  onToggle,
  onReset,
}: {
  persona: YouPersona;
  open: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <Image
        src="/brand/startup-state-mark.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 opacity-80"
      />
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
        You
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {youSummaryChips(persona).map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center whitespace-nowrap rounded-full bg-background-alt px-2 py-0.5 text-xs"
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-8 items-center rounded-md px-2 text-xs text-foreground-muted hover:bg-background-alt hover:text-foreground"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-background-alt px-2.5 text-xs font-semibold"
        >
          Edit
        </button>
      </div>
    </>
  );
}

function PersonaForm({
  persona,
  onCommit,
  onCancel,
}: {
  persona: YouPersona;
  onCommit: (persona: YouPersona) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<YouPersona>(persona);

  const toggleCommunity = (community: YouCommunity) => {
    setDraft((current) => ({
      ...current,
      fixtureId: null,
      communities: current.communities.includes(community)
        ? current.communities.filter((item) => item !== community)
        : [...current.communities, community],
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
          Refine your persona
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground-muted">{TEST_CASES_LABEL}</span>
          {FIXTURE_CHIPS.map((chip) => {
            const selected = draft.fixtureId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setDraft(applyTestCase(chip.id))}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selected
                    ? "bg-midnight text-white"
                    : "border border-border bg-white text-foreground hover:border-midnight"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Stage">
          <div className="flex flex-wrap gap-1.5">
            {YOU_STAGES.map((stage) => {
              const on = draft.stage === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setDraft({ ...draft, stage, fixtureId: null })}
                  className={`h-7 rounded-full border px-2.5 text-xs ${
                    on
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-border text-foreground-muted"
                  }`}
                >
                  {YOU_STAGE_LABEL[stage]}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Communities">
          <div className="flex flex-wrap gap-1.5">
            {YOU_COMMUNITIES.map((community) => {
              const on = draft.communities.includes(community);
              return (
                <button
                  key={community}
                  type="button"
                  onClick={() => toggleCommunity(community)}
                  className={`h-7 rounded-full border px-2.5 text-xs ${
                    on
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-border text-foreground-muted"
                  }`}
                >
                  {community}
                </button>
              );
            })}
          </div>
        </Field>
        <SelectField
          label="Sector"
          value={draft.sector}
          options={YOU_SECTORS}
          onChange={(sector) => setDraft({ ...draft, sector, fixtureId: null })}
        />
        <SelectField
          label="Goal"
          value={draft.goal}
          options={YOU_GOALS}
          onChange={(goal) => setDraft({ ...draft, goal, fixtureId: null })}
        />
        <SelectField
          label="Region"
          value={draft.region}
          options={YOU_REGIONS}
          onChange={(region) => setDraft({ ...draft, region, fixtureId: null })}
        />
        <SelectField
          label="Revenue"
          value={draft.revenue}
          options={YOU_REVENUES}
          onChange={(revenue) => setDraft({ ...draft, revenue, fixtureId: null })}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-md px-3 text-sm font-semibold text-foreground-muted hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onCommit(draft)}
          className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
      {label}
      <div className="mt-2 font-normal normal-case tracking-normal">{children}</div>
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm font-normal text-foreground"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}
