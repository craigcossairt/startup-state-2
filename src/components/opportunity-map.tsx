"use client";

import { useEffect, useMemo, useState } from "react";
import { CompanySnapshot } from "@/components/company-snapshot";
import { FixtureRail } from "@/components/fixture-rail";
import { MapFilterBar } from "@/components/map-filter-bar";
import { MapMetrics } from "@/components/map-metrics";
import { ProgressStatus } from "@/components/progress-status";
import { RankedOpportunityCard } from "@/components/ranked-card";
import { newOpportunityIds, subscribeToSearch } from "@/lib/bonus/alerts";
import { TEST_CASES_LABEL } from "@/lib/copy";
import {
  pendingCardsFromPreviews,
  summarizeMapMetrics,
  type MapMetrics as MapMetricsSummary,
  type RankProgressStage,
} from "@/lib/map-metrics";
import { sortRankedCards } from "@/lib/rank/sort";
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

export function OpportunityMap({
  initialFixture,
}: {
  initialFixture?: string;
}) {
  const fixture = isFixtureId(initialFixture) ? initialFixture : undefined;
  const [company, setCompany] = useState<CompanyProfile | null>(null);
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
  const [fitFilter, setFitFilter] = useState<FitLabel | "all">("all");
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [profileRevision, setProfileRevision] = useState(0);
  const [watching, setWatching] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [chipsReady, setChipsReady] = useState(false);

  const chips: RetrieveChips = {
    lane: lane === "all" ? undefined : lane,
    extraGoeoKeys: extraKeys,
    includeDirectory: directory,
  };

  useEffect(() => {
    const last = peekCachedMap();
    if (last) {
      setLane(last.chips.lane ?? "all");
      setExtraKeys(last.chips.extraGoeoKeys ?? []);
      setDirectory(Boolean(last.chips.includeDirectory));
    }
    setChipsReady(true);
  }, []);

  useEffect(() => {
    if (!chipsReady) return;
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const profile = await resolveProfile(fixture);
        if (!profile) {
          throw new Error("No company profile yet. Start from Intake.");
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
          applyWatch(profile, cached.payload.retrievedIds);
          return;
        }

        setBusy(true);
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
            setCards(pendingCardsFromPreviews(event.previews ?? []));
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
  }, [chipsReady, fixture, lane, extraKeys.join("|"), directory, profileRevision]);

  function applyWatch(profile: CompanyProfile, ids: string[]) {
    const saved = loadSavedSearch();
    const match = Boolean(saved && isCurrentWatchedSearch(saved, profile, chips));
    setWatching(match);
    setNewCount(match && saved ? newOpportunityIds(saved.seenIds, ids).length : 0);
  }

  const metrics: MapMetricsSummary | null = useMemo(() => {
    if (payload) return summarizeMapMetrics(payload);
    if (cards.length > 0 || retrievedIds.length > 0) {
      return summarizeMapMetrics({ cards: cards.filter((card) => !card.ranking), retrievedIds });
    }
    return null;
  }, [payload, cards, retrievedIds]);

  const visible = useMemo(() => {
    if (fitFilter === "all") return cards;
    return cards.filter((card) => !card.ranking && card.fit === fitFilter);
  }, [cards, fitFilter]);

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="eyebrow">Opportunity Map</p>
      <h1 className="h-display mt-2 text-3xl sm:text-4xl">Ranked programs</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        Fit first. Federal and Utah on the same list. Switch test cases without
        going back to Intake.
      </p>

      <div className="mt-6">
        <MapFilterBar
          ranked={payload?.cards.length ?? cards.filter((card) => !card.ranking).length}
          retrieved={retrievedIds.length}
          lane={lane}
          extraKeys={extraKeys}
          directory={directory}
          fitFilter={fitFilter}
          firedKeys={firedKeys}
          watching={watching}
          newCount={newCount}
          topicsOpen={topicsOpen}
          onLane={setLane}
          onToggleKey={(key) =>
            setExtraKeys((current) =>
              current.includes(key)
                ? current.filter((item) => item !== key)
                : [...current, key],
            )
          }
          onDirectory={() => setDirectory((value) => !value)}
          onFit={setFitFilter}
          onWatch={watchSearch}
          onTopics={() => setTopicsOpen((value) => !value)}
        />
      </div>

      {company ? (
        <div className="mt-6">
          <CompanySnapshot
            profile={company}
            cards={payload?.cards ?? cards.filter((card) => !card.ranking)}
            onSave={(next) => {
              const ready = confirmInferredMustHaves(promoteFilledMustHaves(next));
              saveProfile(ready);
              setCompany(ready);
              setProfileRevision((value) => value + 1);
            }}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <p className="eyebrow mb-2">{TEST_CASES_LABEL}</p>
        <FixtureRail active={fixture} />
      </div>

      {busy ? (
        <div className="mt-8">
          <ProgressStatus kind="map" active={stage} message={stageMessage} />
        </div>
      ) : null}
      {error ? <p className="mt-8 text-sm text-red-700">{error}</p> : null}

      {metrics ? <MapMetrics metrics={metrics} /> : null}

      {payload?.floorTripped && payload.floorBanner ? (
        <div className="mt-8 rounded-xl bg-midnight px-5 py-4 text-white">
          <p className="font-semibold">{payload.floorBanner}</p>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {visible.map((card) => (
          <div key={card.opportunity.id} className="ss2-card-enter">
            <RankedOpportunityCard card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

function mergeRankedCard(current: RankedCard[], rankedCard: RankedCard): RankedCard[] {
  const byId = new Map(current.map((card) => [card.opportunity.id, card]));
  byId.set(rankedCard.opportunity.id, rankedCard);
  const ranked = sortRankedCards([...byId.values()].filter((card) => !card.ranking));
  const pending = [...byId.values()].filter((card) => card.ranking);
  return [...ranked, ...pending];
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
