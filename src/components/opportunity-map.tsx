"use client";

import { useEffect, useMemo, useState } from "react";
import { BonusBar } from "@/components/bonus-bar";
import { FixtureRail } from "@/components/fixture-rail";
import { MapMetrics } from "@/components/map-metrics";
import { ProgressStatus } from "@/components/progress-status";
import { RankedOpportunityCard } from "@/components/ranked-card";
import { GOEO_KEY_LABELS } from "@/lib/copy";
import {
  summarizeMapMetrics,
  type MapMetrics as MapMetricsSummary,
  type RankProgressStage,
  type RetrievedPreview,
} from "@/lib/map-metrics";
import { readRankStream } from "@/lib/rank/stream-events";
import { saveMapPayload } from "@/lib/session-map";
import { loadStoredProfile, saveProfile } from "@/lib/session-profile";
import type { CompanyProfile, FixtureId } from "@/lib/types/company-profile";
import type {
  FitLabel,
  GoeoKey,
  OpportunityMapPayload,
  RankedCard,
  RetrieveChips,
} from "@/lib/types/opportunity";

const GOEO_KEYS = Object.keys(GOEO_KEY_LABELS) as GoeoKey[];
const FIT_FILTERS: FitLabel[] = [
  "likely",
  "potential-verify",
  "adjacent",
  "probably_not",
];

export function OpportunityMap({
  initialFixture,
}: {
  initialFixture?: string;
}) {
  const fixture = isFixtureId(initialFixture) ? initialFixture : undefined;
  const [payload, setPayload] = useState<OpportunityMapPayload | null>(null);
  const [cards, setCards] = useState<RankedCard[]>([]);
  const [previews, setPreviews] = useState<RetrievedPreview[]>([]);
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

  const chips: RetrieveChips = {
    lane: lane === "all" ? undefined : lane,
    extraGoeoKeys: extraKeys,
    includeDirectory: directory,
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setBusy(true);
      setError(null);
      setPayload(null);
      setCards([]);
      setPreviews([]);
      setRetrievedIds([]);
      setFiredKeys([]);
      setStage("retrieve");
      setStageMessage("Searching federal and Utah programs");
      try {
        const profile = await resolveProfile(fixture);
        if (!profile) {
          throw new Error("No company profile yet. Start from Intake.");
        }
        saveProfile(profile);
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
        const streamed: RankedCard[] = [];
        await readRankStream(response, (event) => {
          if (cancelled) return;
          if (event.type === "progress") {
            setStage(event.stage);
            setStageMessage(event.message);
            return;
          }
          if (event.type === "retrieved") {
            setRetrievedIds(event.retrievedIds);
            setPreviews(event.previews ?? []);
            setFiredKeys(event.firedKeys);
            return;
          }
          if (event.type === "card" && "fit" in event.card) {
            streamed.push(event.card);
            setCards([...streamed]);
            return;
          }
          if (event.type === "done" && event.payload) {
            saveMapPayload(event.payload);
            setPayload(event.payload);
            setCards(event.payload.cards);
            setRetrievedIds(event.payload.retrievedIds);
            setFiredKeys(event.payload.firedKeys);
            return;
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
  }, [fixture, lane, extraKeys.join("|"), directory]);

  const metrics: MapMetricsSummary | null = useMemo(() => {
    if (payload) return summarizeMapMetrics(payload);
    if (cards.length > 0 || retrievedIds.length > 0) {
      return summarizeMapMetrics({ cards, retrievedIds });
    }
    return null;
  }, [payload, cards, retrievedIds]);

  const visible = useMemo(() => {
    if (fitFilter === "all") return cards;
    return cards.filter((card) => card.fit === fitFilter);
  }, [cards, fitFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="eyebrow">Opportunity Map</p>
      <h1 className="h-display mt-2 text-3xl sm:text-4xl">Ranked programs</h1>
      <p className="mt-2 max-w-2xl text-foreground-muted">
        Fit first. Federal and Utah on the same list. Switch fixtures without
        going back to Intake.
      </p>

      <div className="mt-6">
        <p className="eyebrow mb-2">Fixtures</p>
        <FixtureRail active={fixture} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip
          active={lane === "all"}
          onClick={() => setLane("all")}
          label="All lanes"
        />
        <Chip
          active={lane === "federal"}
          onClick={() => setLane("federal")}
          label="Federal"
        />
        <Chip
          active={lane === "state"}
          onClick={() => setLane("state")}
          label="Utah"
        />
        {GOEO_KEYS.map((key) => (
          <Chip
            key={key}
            active={extraKeys.includes(key) || firedKeys.includes(key)}
            onClick={() =>
              setExtraKeys((current) =>
                current.includes(key)
                  ? current.filter((item) => item !== key)
                  : [...current, key],
              )
            }
            label={GOEO_KEY_LABELS[key]}
          />
        ))}
        <Chip
          active={directory}
          onClick={() => setDirectory((value) => !value)}
          label="directory"
        />
        {FIT_FILTERS.map((fit) => (
          <Chip
            key={fit}
            active={fitFilter === fit}
            onClick={() => setFitFilter((current) => (current === fit ? "all" : fit))}
            label={fit === "probably_not" ? "probably not" : fit}
          />
        ))}
      </div>

      <div className="mt-4">
        <p className="eyebrow mb-2">This map</p>
        <BonusBar />
      </div>

      {busy ? (
        <div className="mt-8">
          <ProgressStatus kind="map" active={stage} message={stageMessage} />
        </div>
      ) : null}
      {error ? <p className="mt-8 text-sm text-red-700">{error}</p> : null}

      {metrics ? <MapMetrics metrics={metrics} /> : null}

      {busy && cards.length === 0 && previews.length > 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-off-white p-5">
          <p className="eyebrow">Found so far</p>
          <ul className="mt-3 space-y-2 text-sm">
            {previews.slice(0, 8).map((row) => (
              <li key={row.id} className="flex flex-wrap gap-2">
                <span className="font-semibold">{row.program}</span>
                <span className="text-foreground-muted">
                  {row.lane === "federal" ? "Federal" : "Utah"} · {row.agency}
                </span>
              </li>
            ))}
            {previews.length > 8 ? (
              <li className="text-foreground-muted">
                {previews.length - 8} more while we rank by fit
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

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

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
        active
          ? "border-vibrant-green bg-accent-soft text-midnight"
          : "border-border bg-white"
      }`}
    >
      {label}
    </button>
  );
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
