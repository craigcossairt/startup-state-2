"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CompanySnapshot } from "@/components/company-snapshot";
import { FixtureRail } from "@/components/fixture-rail";
import { MapFilterBar } from "@/components/map-filter-bar";
import { MapMetrics } from "@/components/map-metrics";
import { ProgressStatus } from "@/components/progress-status";
import { RankedOpportunityCard } from "@/components/ranked-card";
import { newOpportunityIds, subscribeToSearch } from "@/lib/bonus/alerts";
import { filterRankedCards } from "@/lib/catalog/match-resources";
import { parseLeftoverFixtureId } from "@/lib/catalog/leftover-test-case";
import { paramsToPersona, personaIsFilled } from "@/lib/catalog/you-persona";
import {
  FLOOR_BANNER,
  FLOOR_EYEBROW,
  FLOOR_FOLLOW,
  MAP_EMPTY_CTA,
  MAP_EMPTY_LEAD,
  TEST_CASES_LABEL,
} from "@/lib/copy";
import { SECTOR_LABELS as SECTOR_WORDS } from "@/lib/labels";
import { formatUsdCompact } from "@/lib/map-metrics";
import {
  summarizeMapMetrics,
  type MapMetrics as MapMetricsSummary,
  type RankProgressStage,
} from "@/lib/map-metrics";
import { sortRankedCards } from "@/lib/rank/sort";
import { cardsReadyToPaint } from "@/lib/rank/stream-paint";
import { readRankStream } from "@/lib/rank/stream-events";
import { confirmInferredMustHaves, promoteFilledMustHaves } from "@/lib/profile/must-haves";
import {
  isCurrentWatchedSearch,
  loadCachedMap,
  loadSavedSearch,
  peekCachedMap,
  persistSavedSearch,
  saveCachedMap,
} from "@/lib/session-map";
import { loadStoredProfile, saveProfile } from "@/lib/session-profile";
import type { CompanyProfile, FixtureId } from "@/lib/types/company-profile";
import type {
  FitLabel,
  GoeoKey,
  OpportunityMapPayload,
  RankedCard,
  RetrieveChips,
} from "@/lib/types/opportunity";

const ALL_FITS: Record<FitLabel, boolean> = {
  likely: true,
  "potential-verify": true,
  adjacent: true,
  probably_not: true,
};

export function OpportunityMap({
  initialFixture,
}: {
  initialFixture?: string;
}) {
  const searchParams = useSearchParams();
  const fixture =
    parseLeftoverFixtureId(searchParams.get("fixture")) ??
    (isFixtureId(initialFixture) ? initialFixture : undefined);
  const persona = personaIsFilled(searchParams) ? paramsToPersona(searchParams) : null;
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [missingCompany, setMissingCompany] = useState(false);
  const [payload, setPayload] = useState<OpportunityMapPayload | null>(null);
  const [cards, setCards] = useState<RankedCard[]>([]);
  const [retrievedIds, setRetrievedIds] = useState<string[]>([]);
  const [firedKeys, setFiredKeys] = useState<GoeoKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<RankProgressStage>("retrieve");
  const [stageMessage, setStageMessage] = useState("Searching federal and Utah programs");
  const [lane, setLane] = useState<"all" | "federal" | "state">("all");
  const [extraKeys, setExtraKeys] = useState<GoeoKey[]>([]);
  const [directory, setDirectory] = useState(false);
  const [appliedLane, setAppliedLane] = useState<"all" | "federal" | "state">("all");
  const [appliedKeys, setAppliedKeys] = useState<GoeoKey[]>([]);
  const [appliedDirectory, setAppliedDirectory] = useState(false);
  const [fits, setFits] = useState<Record<FitLabel, boolean>>(ALL_FITS);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileRevision, setProfileRevision] = useState(0);
  const [watching, setWatching] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [chipsReady, setChipsReady] = useState(false);
  const [restored, setRestored] = useState(false);

  const chips: RetrieveChips = {
    lane: appliedLane === "all" ? undefined : appliedLane,
    extraGoeoKeys: appliedKeys,
    includeDirectory: appliedDirectory,
  };
  const dirty =
    lane !== appliedLane ||
    directory !== appliedDirectory ||
    extraKeys.join("|") !== appliedKeys.join("|");

  useEffect(() => {
    const last = peekCachedMap();
    if (last) {
      const nextLane = last.chips.lane ?? "all";
      const nextKeys = last.chips.extraGoeoKeys ?? [];
      const nextDirectory = Boolean(last.chips.includeDirectory);
      setLane(nextLane);
      setExtraKeys(nextKeys);
      setDirectory(nextDirectory);
      setAppliedLane(nextLane);
      setAppliedKeys(nextKeys);
      setAppliedDirectory(nextDirectory);
    }
    setChipsReady(true);
  }, []);

  useEffect(() => {
    if (!chipsReady) return;
    let cancelled = false;
    async function load() {
      setError(null);
      setMissingCompany(false);
      try {
        const profile = await resolveProfile(fixture);
        if (!profile) {
          if (!cancelled) {
            setCompany(null);
            setMissingCompany(true);
            setBusy(false);
          }
          return;
        }
        saveProfile(profile);
        if (!cancelled) setCompany(profile);

        const cached = loadCachedMap(profile, chips);
        if (cached) {
          if (cancelled) return;
          setPayload(cached.payload);
          setCards(cached.payload.cards);
          setRetrievedIds(cached.payload.retrievedIds);
          setFiredKeys(cached.payload.firedKeys);
          setBusy(false);
          setRestored(true);
          applyWatch(profile, cached.payload.retrievedIds);
          return;
        }

        setBusy(true);
        setRestored(false);
        setPayload(null);
        setCards([]);
        setRetrievedIds([]);
        setFiredKeys([]);
        setStage("retrieve");
        setStageMessage("Searching federal and Utah programs");

        const response = await fetch("/api/rank", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "text/event-stream",
          },
          body: JSON.stringify({ profile, chips }),
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        await readRankStream(response, (event) => {
          if (cancelled) return;
          if (event.type === "progress") {
            setStage(event.stage);
            setStageMessage(event.message);
            return;
          }
          if (event.type === "retrieved") {
            setRetrievedIds(event.retrievedIds);
            setFiredKeys(event.firedKeys);
            applyWatch(profile, event.retrievedIds);
            return;
          }
          if (event.type === "card" && "fit" in event.card && "opportunity" in event.card) {
            const rankedCard = event.card as RankedCard;
            setCards((current) => mergeRankedCard(current, rankedCard));
            return;
          }
          if (event.type === "done" && event.payload) {
            saveCachedMap({ profile, chips, payload: event.payload });
            setPayload(event.payload);
            setCards(event.payload.cards);
            setRetrievedIds(event.payload.retrievedIds);
            setFiredKeys(event.payload.firedKeys);
            applyWatch(profile, event.payload.retrievedIds);
          }
          if (event.type === "error") {
            setError(event.message);
          }
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Map failed");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // chips are rebuilt each render; depend on the primitive fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipsReady, fixture, appliedLane, appliedKeys.join("|"), appliedDirectory, profileRevision]);

  function applyWatch(profile: CompanyProfile, ids: string[]) {
    const saved = loadSavedSearch();
    const match = Boolean(saved && isCurrentWatchedSearch(saved, profile, chips));
    setWatching(match);
    setNewCount(match && saved ? newOpportunityIds(saved.seenIds, ids).length : 0);
  }

  const metrics: MapMetricsSummary | null = useMemo(() => {
    if (payload) return summarizeMapMetrics(payload);
    if (cards.length > 0 || retrievedIds.length > 0) {
      return summarizeMapMetrics({ cards, retrievedIds });
    }
    return null;
  }, [payload, cards, retrievedIds]);

  const visible = useMemo(() => {
    const byFit = cardsReadyToPaint(cards, fits);
    if (fixture) return byFit;
    return filterRankedCards(byFit, persona);
  }, [cards, fits, fixture, persona]);

  const rankedCount = payload?.cards.length ?? cards.length;
  const filterEmpty = !busy && !error && !missingCompany && rankedCount > 0 && visible.length === 0;

  function watchSearch() {
    if (!company) return;
    const search = subscribeToSearch({
      profile: company,
      chips,
      seenIds: retrievedIds,
    });
    persistSavedSearch(search);
    setWatching(true);
    setNewCount(0);
  }

  function applyRetrieve() {
    setAppliedLane(lane);
    setAppliedKeys(extraKeys);
    setAppliedDirectory(directory);
    if (!dirty) setProfileRevision((value) => value + 1);
  }

  if (missingCompany) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 py-28">
        <div className="max-w-[560px] text-center">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground-muted">
            Opportunity Map
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.01em] text-midnight">
            No company profile yet. Start from Intake.
          </h1>
          <p className="mx-auto mt-4 mb-8 max-w-xl font-serif text-[19px] leading-relaxed text-foreground-muted">
            {MAP_EMPTY_LEAD}
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-vibrant-green px-7 py-3 text-[15px] font-bold text-white hover:bg-primary-hover"
          >
            {MAP_EMPTY_CTA}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white">
      {company ? (
        <section className="bg-midnight text-white">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-start gap-12 px-6 py-9 sm:px-8">
            <div className="min-w-[280px] flex-1">
              <p className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-bright-green">
                Opportunities
              </p>
              <h1 className="max-w-[760px] font-display text-[34px] font-extrabold leading-tight tracking-[-0.01em] text-white">
                {company.whatTheyDo.value ?? "Company profile"}
              </h1>
              <div className="mt-3.5 mb-3.5 flex flex-wrap gap-2">
                {(company.sectors.value ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-light-green/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-light-green"
                  >
                    {SECTOR_WORDS[tag] ?? tag}
                  </span>
                ))}
              </div>
              <p className="text-[15px] leading-relaxed text-platinum">
                {companyLine(company)}
              </p>
            </div>
            <div className="flex min-w-[240px] flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="rounded-full border border-white/35 bg-transparent px-5 py-2.5 text-sm font-semibold text-white"
              >
                {profileOpen ? "Hide company profile" : "Company profile"}
              </button>
              {watching ? (
                <Link
                  href="/map/alerts"
                  className="rounded-full border border-bright-green bg-bright-green/12 px-5 py-2.5 text-center text-sm font-bold text-bright-green"
                >
                  Watching this search
                  {newCount > 0 ? ` · ${newCount} new` : ""}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={watchSearch}
                  className="rounded-full bg-vibrant-green px-5 py-2.5 text-sm font-bold text-white"
                >
                  Watch this search
                </button>
              )}
              <p className="max-w-[240px] text-xs leading-snug text-[#6b6c70]">
                Watch stores this company plus the current retrieve set.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1320px] px-6 py-4 sm:px-8">
          <p className="eyebrow mb-3">{TEST_CASES_LABEL}</p>
          <FixtureRail active={fixture} />
        </div>
      </div>

      {profileOpen && company ? (
        <div className="border-b border-border bg-white">
          <div className="mx-auto max-w-[1320px] px-6 py-6 sm:px-8">
            <CompanySnapshot
              profile={company}
              cards={payload?.cards ?? cards}
              onSave={(next) => {
                const ready = confirmInferredMustHaves(promoteFilledMustHaves(next));
                saveProfile(ready);
                setCompany(ready);
                setProfileOpen(false);
                setProfileRevision((value) => value + 1);
              }}
            />
          </div>
        </div>
      ) : null}

      {metrics ? <MapMetrics metrics={metrics} /> : null}

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-11 px-6 py-8 sm:px-8 lg:grid-cols-[272px_1fr]">
        <MapFilterBar
          lane={lane}
          extraKeys={extraKeys}
          directory={directory}
          fits={fits}
          firedKeys={firedKeys}
          dirty={dirty}
          busy={busy}
          onLane={setLane}
          onToggleKey={(key) =>
            setExtraKeys((current) =>
              current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key],
            )
          }
          onDirectory={() => setDirectory((value) => !value)}
          onToggleFit={(fit) => setFits((current) => ({ ...current, [fit]: !current[fit] }))}
          onRerank={applyRetrieve}
        />

        <section>
          {busy ? (
            <div className="mb-5">
              <ProgressStatus kind="map" active={stage} message={stageMessage} />
            </div>
          ) : null}

          {error ? (
            <div className="rounded border border-border border-t-[3px] border-t-[#ff6840] bg-white p-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff6840]">
                Ranking failed
              </p>
              <h2 className="font-display text-2xl font-extrabold text-midnight">
                We could not finish ranking this company.
              </h2>
              <p className="mt-2.5 max-w-xl text-base text-foreground">{error}</p>
              <p className="mt-2 mb-6 text-sm text-foreground-muted">
                Try again with the same company and retrieve set, or open a different test company.
              </p>
              <button
                type="button"
                onClick={applyRetrieve}
                className="rounded-full bg-vibrant-green px-6 py-3 text-[15px] font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : null}

          {restored && !busy && !error ? (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded border border-border bg-white px-4 py-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-vibrant-green" />
              <span className="text-sm text-foreground">
                Restored from this session. This company and these retrieve controls were ranked
                earlier in the tab.
              </span>
              <button
                type="button"
                onClick={() => {
                  setRestored(false);
                  setProfileRevision((value) => value + 1);
                }}
                className="ml-auto bg-transparent p-0 text-[13px] font-bold text-vibrant-green"
              >
                Rank again
              </button>
            </div>
          ) : null}

          {payload?.floorTripped && payload.floorBanner && !busy ? (
            <div className="mb-6 rounded border border-light-green bg-[#f0fbf3] px-7 py-6">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-vibrant-green">
                {FLOOR_EYEBROW}
              </p>
              <p className="mb-2.5 font-serif text-[21px] leading-snug text-midnight">
                {payload.floorBanner || FLOOR_BANNER}
              </p>
              <p className="text-sm leading-relaxed text-foreground">{FLOOR_FOLLOW}</p>
            </div>
          ) : null}

          {filterEmpty ? (
            <div className="rounded border border-border bg-white px-8 py-10 text-center">
              <h2 className="font-display text-xl font-extrabold text-midnight">
                No ranked listing matches this Fit filter.
              </h2>
              <p className="mx-auto mt-2 mb-5 max-w-md text-[15px] leading-relaxed text-foreground-muted">
                The retrieved set is still here. The filter is hiding it. Turn a Fit back on to see
                the ranked listings again.
              </p>
              <button
                type="button"
                onClick={() => setFits(ALL_FITS)}
                className="rounded-full border border-platinum px-5 py-2.5 text-sm font-bold text-midnight"
              >
                Show all Fit levels
              </button>
            </div>
          ) : null}

          {!error && !filterEmpty && visible.length > 0 ? (
            <>
              <div className="mb-3.5 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-xl font-extrabold text-midnight">
                  {busy
                    ? `Ranking ${retrievedIds.length} retrieved listings`
                    : visible.length === rankedCount
                      ? "Ranked listings"
                      : `${visible.length} of ${rankedCount} ranked listings in view`}
                </h2>
                <span className="text-[13px] text-foreground-muted">
                  Best Fit first. Federal and Utah interleave.
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {visible.map((card) => (
                  <div key={card.opportunity.id} className="ss2-card-enter">
                    <RankedOpportunityCard card={card} />
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function companyLine(profile: CompanyProfile): string {
  const place = [profile.hqCity.value, profile.hqState.value, profile.hqCountry.value]
    .filter(Boolean)
    .join(", ");
  const people = profile.employeeCount.value?.min;
  const revenue = profile.revenue.value;
  const raised = profile.capitalRaisedUsd.value;
  const need = profile.capitalNeedUsd.value;
  const parts = [place];
  if (people) parts.push(`${people} people`);
  if (revenue) {
    parts.push(
      `${formatUsdCompact(revenue.amountUsd)}${revenue.basis === "arr" ? " ARR" : ""}`,
    );
  }
  if (raised) parts.push(`${formatUsdCompact(raised)} raised`);
  if (need) {
    parts.push(`needs ${formatUsdCompact(need.minUsd)} to ${formatUsdCompact(need.maxUsd)}`);
  }
  return parts.join(" · ");
}

function mergeRankedCard(current: RankedCard[], rankedCard: RankedCard): RankedCard[] {
  const byId = new Map(current.map((card) => [card.opportunity.id, card]));
  byId.set(rankedCard.opportunity.id, rankedCard);
  return sortRankedCards([...byId.values()]);
}

function isFixtureId(value?: string): value is FixtureId {
  return (
    value === "fixture-1" ||
    value === "fixture-2" ||
    value === "fixture-3" ||
    value === "fixture-4" ||
    value === "fixture-5"
  );
}

async function resolveProfile(fixture?: FixtureId): Promise<CompanyProfile | null> {
  if (fixture) {
    const response = await fetch(`/api/fixtures/${fixture}`);
    if (!response.ok) return null;
    return (await response.json()) as CompanyProfile;
  }
  return loadStoredProfile();
}
