"use client";

import { useEffect, useMemo, useState } from "react";
import { BonusBar } from "@/components/bonus-bar";
import { FixtureRail } from "@/components/fixture-rail";
import { RankedOpportunityCard } from "@/components/ranked-card";
import { GOEO_KEY_LABELS } from "@/lib/copy";
import { saveMapPayload } from "@/lib/session-map";
import { loadStoredProfile, saveProfile } from "@/lib/session-profile";
import type { CompanyProfile, FixtureId } from "@/lib/types/company-profile";
import type {
  FitLabel,
  GoeoKey,
  OpportunityMapPayload,
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
      try {
        const profile = await resolveProfile(fixture);
        if (!profile) {
          throw new Error("No company profile yet. Start from Intake.");
        }
        saveProfile(profile);
        const response = await fetch("/api/rank", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile, chips }),
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const next = (await response.json()) as OpportunityMapPayload;
        saveMapPayload(next);
        if (!cancelled) setPayload(next);
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

  const visible = useMemo(() => {
    if (!payload) return [];
    if (fitFilter === "all") return payload.cards;
    return payload.cards.filter((card) => card.fit === fitFilter);
  }, [payload, fitFilter]);

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
            active={extraKeys.includes(key) || Boolean(payload?.firedKeys.includes(key))}
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

      {busy ? <p className="mt-8 text-sm">Building the Opportunity Map...</p> : null}
      {error ? <p className="mt-8 text-sm text-red-700">{error}</p> : null}

      {payload?.floorTripped && payload.floorBanner ? (
        <div className="mt-8 rounded-xl bg-midnight px-5 py-4 text-white">
          <p className="font-semibold">{payload.floorBanner}</p>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {visible.map((card) => (
          <RankedOpportunityCard key={card.opportunity.id} card={card} />
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
