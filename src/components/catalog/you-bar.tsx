"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MustHaveField } from "@/components/must-have-field";
import {
  announceYouBarOpen,
  beginYouBarDraft,
  persistBarApply,
  prepareBarApply,
  toggleSourceFromEvent,
  withPreservedRailFixture,
  youBarStrip,
  YOU_BAR_TOGGLE_EVENT,
  type BarDraft,
  type YouBarOpenSource,
} from "@/lib/catalog/you-bar-apply";
import { parseLeftoverFixtureId } from "@/lib/catalog/leftover-test-case";
import { FIXTURE_CHIPS, MAP_EMPTY_CTA, TEST_CASES_LABEL } from "@/lib/copy";
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
import { applyMustHaveDraft } from "@/lib/profile/must-haves";
import { loadStoredProfile } from "@/lib/session-profile";
import { MUST_HAVE_KEYS, type CompanyProfile, type MustHaveKey } from "@/lib/types/company-profile";

export function YouBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = paramsToPersona(searchParams);
  const filledInUrl = personaIsFilled(searchParams);
  const fixtureId = parseLeftoverFixtureId(searchParams.get("fixture"));
  const [filled, setFilled] = useState(filledInUrl);
  const [persona, setPersona] = useState<YouPersona>(fromUrl);
  const [open, setOpen] = useState(false);
  const [inviteText, setInviteText] = useState("");
  const [draft, setDraft] = useState<BarDraft | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

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
    const params = withPreservedRailFixture(
      personaToParams(stored),
      parseLeftoverFixtureId(new URLSearchParams(window.location.search).get("fixture")),
    );
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, []);

  useEffect(() => {
    if (!personaIsFilled(searchParams)) return;
    const next = paramsToPersona(searchParams);
    setPersona(next);
    setFilled(true);
    saveYouPersona(next);
  }, [searchParams]);

  useEffect(() => {
    const stored = loadStoredProfile();
    setProfile(stored);
    if (!open) return;
    setDraft(beginYouBarDraft({ pathname, persona, profile: stored }));
  }, [fixtureId]);

  useEffect(() => {
    announceYouBarOpen(open);
  }, [open]);

  const strip = youBarStrip({
    pathname,
    persona,
    personaFilled: filled,
    profile,
    fixtureId,
  });

  function replacePersonaUrl(next: YouPersona) {
    setPersona(next);
    setFilled(true);
    const params = withPreservedRailFixture(personaToParams(next), fixtureId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleSlot(source: YouBarOpenSource) {
    const stored = loadStoredProfile();
    setProfile(stored);
    const nextStrip = youBarStrip({
      pathname,
      persona,
      personaFilled: filled,
      profile: stored,
      fixtureId,
    });
    if (nextStrip.kind === "intake-cta") return;
    if (open) {
      setOpen(false);
      setDraft(null);
      return;
    }
    setDraft(beginYouBarDraft({ pathname, persona, profile: stored }));
    setOpen(true);
    if (source === "map-hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const toggleSlotRef = useRef(toggleSlot);
  toggleSlotRef.current = toggleSlot;

  useEffect(() => {
    const onToggle = (event: Event) => {
      toggleSlotRef.current(toggleSourceFromEvent(event));
    };
    window.addEventListener(YOU_BAR_TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(YOU_BAR_TOGGLE_EVENT, onToggle);
  }, []);

  const reset = () => {
    setFilled(false);
    setPersona(EMPTY_YOU_PERSONA);
    setOpen(false);
    setDraft(null);
    window.localStorage.removeItem(YOU_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(YOU_CHANGED_EVENT));
    router.replace(pathname, { scroll: false });
  };

  function applyDraft() {
    if (!draft) return;
    const verdict = prepareBarApply(draft);
    if (verdict.status === "blocked") return;
    persistBarApply(verdict, { replaceUrl: replacePersonaUrl });
    if (verdict.mode === "dual") setProfile(verdict.profile);
    setOpen(false);
    setDraft(null);
  }

  return (
    <div
      className={`sticky top-14 z-20 border-b border-border bg-background/85 backdrop-blur-md ${
        open ? "flex max-h-[calc(100dvh-3.5rem)] flex-col" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] shrink-0 items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6">
        {strip.kind === "intake-cta" ? (
          <IntakeCtaStrip persona={strip.persona} onReset={reset} />
        ) : strip.kind === "summary" ? (
          <FilledSummary
            persona={strip.persona}
            open={open}
            onToggle={() => toggleSlot("strip")}
            onReset={reset}
          />
        ) : (
          <form
            className={`flex w-full items-center gap-2 sm:gap-3 ${
              !open && !inviteText.trim() ? "persona-bar-breathing" : ""
            }`}
            onSubmit={(event) => {
              event.preventDefault();
              toggleSlot("strip");
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
              value={inviteText}
              onChange={(event) => setInviteText(event.target.value)}
              placeholder="Tell us about your business to get a personalized action plan"
              className="h-8 min-w-0 flex-1 bg-transparent text-sm placeholder:text-foreground-muted/70 focus:outline-none"
            />
            {inviteText.trim().length > 3 ? (
              <button
                type="submit"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90"
              >
                Personalize
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleSlot("strip")}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-background-alt px-2.5 text-xs text-foreground-muted hover:text-foreground"
              >
                Open form
              </button>
            )}
          </form>
        )}
      </div>
      {open && draft ? (
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-border bg-background-alt">
          <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
            <CompanyProfileForm
              draft={draft}
              onChange={setDraft}
              onCommit={applyDraft}
              onCancel={() => {
                setOpen(false);
                setDraft(null);
              }}
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

function IntakeCtaStrip({
  persona,
  onReset,
}: {
  persona: YouPersona | null;
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
      {persona ? (
        <>
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
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 items-center rounded-md px-2 text-xs text-foreground-muted hover:bg-background-alt hover:text-foreground"
          >
            Clear
          </button>
        </>
      ) : (
        <span className="min-w-0 flex-1 text-sm text-foreground-muted">
          Start from Intake to rank a company.
        </span>
      )}
      <Link
        href="/"
        className="ml-auto inline-flex h-8 shrink-0 items-center rounded-md bg-background-alt px-2.5 text-xs font-semibold"
      >
        {MAP_EMPTY_CTA}
      </Link>
    </>
  );
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

function CompanyProfileForm({
  draft,
  onChange,
  onCommit,
  onCancel,
}: {
  draft: BarDraft;
  onChange: (draft: BarDraft) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const persona = draft.persona;
  const verdict = prepareBarApply(draft);
  const missing = verdict.status === "blocked" ? verdict.missing : [];

  const setPersona = (next: YouPersona) => {
    if (draft.mode === "dual") {
      onChange({ mode: "dual", persona: next, profile: draft.profile });
      return;
    }
    onChange({ mode: "persona", persona: next });
  };

  const toggleCommunity = (community: YouCommunity) => {
    setPersona({
      ...persona,
      fixtureId: null,
      communities: persona.communities.includes(community)
        ? persona.communities.filter((item) => item !== community)
        : [...persona.communities, community],
    });
  };

  const onMustHave = <K extends MustHaveKey>(key: K, value: CompanyProfile[K]["value"]) => {
    if (draft.mode !== "dual") return;
    onChange({
      mode: "dual",
      persona: draft.persona,
      profile: applyMustHaveDraft(draft.profile, key, value),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
          Company profile
        </p>
        {draft.mode === "persona" ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground-muted">{TEST_CASES_LABEL}</span>
            {FIXTURE_CHIPS.map((chip) => {
              const selected = persona.fixtureId === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setPersona(applyTestCase(chip.id))}
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
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Stage">
          <div className="flex flex-wrap gap-1.5">
            {YOU_STAGES.map((stage) => {
              const on = persona.stage === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setPersona({ ...persona, stage, fixtureId: null })}
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
              const on = persona.communities.includes(community);
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
          value={persona.sector}
          options={YOU_SECTORS}
          onChange={(sector) => setPersona({ ...persona, sector, fixtureId: null })}
        />
        <SelectField
          label="Goal"
          value={persona.goal}
          options={YOU_GOALS}
          onChange={(goal) => setPersona({ ...persona, goal, fixtureId: null })}
        />
        <SelectField
          label="Region"
          value={persona.region}
          options={YOU_REGIONS}
          onChange={(region) => setPersona({ ...persona, region, fixtureId: null })}
        />
        <SelectField
          label="Revenue"
          value={persona.revenue}
          options={YOU_REVENUES}
          onChange={(revenue) => setPersona({ ...persona, revenue, fixtureId: null })}
        />
      </div>
      {draft.mode === "dual" ? (
        <div className="space-y-4 border-t border-border pt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
            Fields the ranking uses
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {MUST_HAVE_KEYS.map((key) => (
              <MustHaveField
                key={key}
                fieldKey={key}
                profile={draft.profile}
                onDraft={onMustHave}
              />
            ))}
          </div>
        </div>
      ) : null}
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
          disabled={missing.length > 0}
          onClick={onCommit}
          className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {missing.length > 0 ? `Apply (${missing.length} needed)` : "Apply"}
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
