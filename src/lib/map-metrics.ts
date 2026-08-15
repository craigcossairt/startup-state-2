import type { GoeoKey, OpportunityMapPayload } from "@/lib/types/opportunity";

export type MapMetrics = {
  retrieved: number;
  ranked: number;
  federal: number;
  utah: number;
  likely: number;
  potentialVerify: number;
  adjacent: number;
  probablyNot: number;
  publishedMaxUsd: number | null;
  deadlinesWithin90Days: number;
};

export function summarizeMapMetrics(
  payload: Pick<OpportunityMapPayload, "cards" | "retrievedIds">,
  todayIso = todayUtc(),
): MapMetrics {
  const today = parseIsoDate(todayIso);
  const horizon = addDays(today, 90);
  let publishedMaxUsd = 0;
  let publishedCount = 0;
  let deadlinesWithin90Days = 0;
  let federal = 0;
  let utah = 0;
  let likely = 0;
  let potentialVerify = 0;
  let adjacent = 0;
  let probablyNot = 0;

  for (const card of payload.cards) {
    if (card.opportunity.lane === "federal") federal += 1;
    if (card.opportunity.lane === "state") utah += 1;
    if (card.fit === "likely") likely += 1;
    if (card.fit === "potential-verify") potentialVerify += 1;
    if (card.fit === "adjacent") adjacent += 1;
    if (card.fit === "probably_not") probablyNot += 1;
    const maxUsd = card.opportunity.value?.maxUsd;
    if (typeof maxUsd === "number") {
      publishedMaxUsd += maxUsd;
      publishedCount += 1;
    }
    const deadline = card.opportunity.deadline;
    if (deadline) {
      const day = parseIsoDate(deadline);
      if (day >= today && day <= horizon) deadlinesWithin90Days += 1;
    }
  }

  return {
    retrieved: payload.retrievedIds.length,
    ranked: payload.cards.length,
    federal,
    utah,
    likely,
    potentialVerify,
    adjacent,
    probablyNot,
    publishedMaxUsd: publishedCount > 0 ? publishedMaxUsd : null,
    deadlinesWithin90Days,
  };
}

export function formatUsdCompact(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export type RankProgressStage = "retrieve" | "rank" | "history";

export type RetrievedPreview = {
  id: string;
  program: string;
  lane: "federal" | "state";
  agency: string;
};

export type RankStreamEvent =
  | { type: "progress"; stage: RankProgressStage; message: string }
  | {
      type: "retrieved";
      retrievedIds: string[];
      firedKeys: GoeoKey[];
      federal: number;
      utah: number;
      previews?: RetrievedPreview[];
    }
  | { type: "card"; card: OpportunityMapPayload["cards"][number] | { opportunity: { id: string } } }
  | {
      type: "done";
      floorTripped?: boolean;
      payload?: OpportunityMapPayload;
    }
  | { type: "error"; message: string };
