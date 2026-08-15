import { attachHistory, type HistorySources } from "@/lib/history/attach";
import { loadSbirAwards } from "@/lib/history/sbir";
import { loadUsaSpendingAwards } from "@/lib/history/usaspending";
import { rankRetrievedOpportunities } from "@/lib/grok/rank";
import type { RankStreamEvent } from "@/lib/map-metrics";
import { assembleRankedCards } from "@/lib/rank/assemble";
import { allMustHavesKnown } from "@/lib/profile/must-haves";
import { retrieveOpportunities } from "@/lib/retrieve/retrieve";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type {
  Opportunity,
  OpportunityMapPayload,
  RankModelCard,
  RankedCard,
  RetrieveChips,
} from "@/lib/types/opportunity";

export type RankPipelineDeps = {
  retrieve?: typeof retrieveOpportunities;
  rank?: (
    opportunities: Opportunity[],
    profile: CompanyProfile,
  ) => Promise<RankModelCard[]>;
  history?: (
    profile: CompanyProfile,
    cards: RankedCard[],
  ) => Promise<HistorySources>;
};

export async function* streamRetrieveThenRank(
  profile: CompanyProfile,
  chips: RetrieveChips = {},
  deps: RankPipelineDeps = {},
): AsyncGenerator<RankStreamEvent> {
  if (!allMustHavesKnown(profile)) {
    throw new Error("Opportunity Map does not run until all must-haves are known");
  }

  yield {
    type: "progress",
    stage: "retrieve",
    message: "Searching federal and Utah programs",
  };

  const retrieve = deps.retrieve ?? retrieveOpportunities;
  const retrieved = await retrieve(profile, chips);
  const federal = retrieved.opportunities.filter((row) => row.lane === "federal").length;
  const utah = retrieved.opportunities.filter((row) => row.lane === "state").length;

  yield {
    type: "retrieved",
    retrievedIds: retrieved.retrievedIds,
    firedKeys: retrieved.firedKeys,
    federal,
    utah,
    previews: retrieved.opportunities.map((row) => ({
      id: row.id,
      program: row.program,
      lane: row.lane,
      agency: row.agency.name,
    })),
  };

  yield {
    type: "progress",
    stage: "rank",
    message: "Ranking programs by fit",
  };

  const rank =
    deps.rank ??
    ((opportunities: Opportunity[], current: CompanyProfile) =>
      rankRetrievedOpportunities(current, opportunities));
  const rankCards = await rank(retrieved.opportunities, profile);
  const assembled = assembleRankedCards(
    retrieved.opportunities,
    rankCards,
    retrieved.firedKeys,
  );
  const rankedPayload: OpportunityMapPayload = {
    ...assembled,
    firedKeys: retrieved.firedKeys,
    retrievedIds: retrieved.retrievedIds,
  };

  for (const card of rankedPayload.cards) {
    yield { type: "card", card };
  }

  yield {
    type: "progress",
    stage: "history",
    message: "Attaching similar awards",
  };

  const historyFn = deps.history ?? loadHistory;
  const history = await historyFn(profile, rankedPayload.cards);
  const donePayload: OpportunityMapPayload = {
    ...rankedPayload,
    cards: attachHistory(rankedPayload.cards, profile, history),
  };

  yield {
    type: "done",
    floorTripped: donePayload.floorTripped,
    payload: donePayload,
  };
}

export async function runRetrieveThenRank(
  profile: CompanyProfile,
  chips: RetrieveChips = {},
  deps: RankPipelineDeps = {},
): Promise<OpportunityMapPayload> {
  let done: OpportunityMapPayload | null = null;
  for await (const event of streamRetrieveThenRank(profile, chips, deps)) {
    if (event.type === "done" && event.payload) {
      done = event.payload;
    }
  }
  if (!done) {
    throw new Error("Rank stream finished without a map");
  }
  return done;
}

async function loadHistory(
  profile: CompanyProfile,
  cards: RankedCard[],
): Promise<HistorySources> {
  return Promise.race([
    Promise.all([
      loadSbirAwards(profile),
      loadUsaSpendingAwards(profile, cards),
    ]).then(([sbirAwards, usaAwards]) => ({ sbirAwards, usaAwards })),
    new Promise<HistorySources>((resolve) =>
      setTimeout(() => resolve({ sbirAwards: [], usaAwards: [] }), 8000),
    ),
  ]);
}
