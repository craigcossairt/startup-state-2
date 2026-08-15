import { PADDED_CARD_WHY } from "@/lib/copy";
import type {
  GoeoKey,
  Opportunity,
  OpportunityMapPayload,
  RankModelCard,
  RankedCard,
} from "@/lib/types/opportunity";
import { dropUnknownRankIds } from "./drop";
import { applyProbablyNotFloor } from "./floor";
import { sortRankedCards } from "./sort";

const MAP_MIN = 8;
const MAP_MAX = 12;

function paddedCard(opportunity: Opportunity): RankedCard {
  return {
    opportunity,
    fit: "adjacent",
    why: PADDED_CARD_WHY,
    concerns: ["Confirm eligibility on the official listing."],
    nextStep: {
      label: "Open the listing",
      url: opportunity.url ?? undefined,
    },
    similarAwardees: [],
  };
}

function unusedRetrieved(
  retrieved: Opportunity[],
  cards: RankedCard[],
): Opportunity[] {
  const used = new Set(cards.map((card) => card.opportunity.id));
  return retrieved.filter((row) => !used.has(row.id));
}

function utahCount(cards: RankedCard[]): number {
  return cards.filter((card) => card.opportunity.lane === "state").length;
}

function enforceMapMix(
  cards: RankedCard[],
  retrieved: Opportunity[],
  firedKeys: GoeoKey[],
  floorTripped: boolean,
): RankedCard[] {
  const needUtah =
    firedKeys.length > 0 && retrieved.some((row) => row.lane === "state");
  let next = [...cards];

  if (needUtah && utahCount(next) < 2) {
    const extras = unusedRetrieved(retrieved, next).filter(
      (row) => row.lane === "state",
    );
    next.push(...extras.slice(0, 2 - utahCount(next)).map(paddedCard));
  }

  if (next.length < MAP_MIN) {
    const unused = unusedRetrieved(retrieved, next);
    const stillNeedUtah = needUtah && utahCount(next) < 2;
    const ordered = stillNeedUtah
      ? [
          ...unused.filter((row) => row.lane === "state"),
          ...unused.filter((row) => row.lane !== "state"),
        ]
      : unused;
    for (const row of ordered) {
      if (next.length >= MAP_MIN) break;
      next.push(paddedCard(row));
    }
  }

  if (next.length > MAP_MAX) {
    next = clampMapMix(next, needUtah, floorTripped);
  }
  return next;
}

function clampMapMix(
  cards: RankedCard[],
  needUtah: boolean,
  floorTripped: boolean,
): RankedCard[] {
  const availableUtah = utahCount(cards);
  const minUtah = needUtah ? Math.min(2, availableUtah) : 0;

  if (floorTripped) {
    const utah = cards.filter((card) => card.opportunity.lane === "state");
    const adjacent = cards.filter(
      (card) => card.opportunity.lane === "federal" && card.fit === "adjacent",
    );
    const probablyNot = cards.filter(
      (card) =>
        card.opportunity.lane === "federal" && card.fit === "probably_not",
    );
    const federal = [...adjacent, ...probablyNot];
    const utahBudget = Math.min(
      utah.length,
      Math.max(minUtah, MAP_MAX - federal.length),
    );
    return [...utah.slice(0, utahBudget), ...federal].slice(0, MAP_MAX);
  }

  let kept = cards.slice(0, MAP_MAX);
  if (utahCount(kept) >= minUtah) return kept;
  const droppedUtah = cards
    .slice(MAP_MAX)
    .filter((card) => card.opportunity.lane === "state");
  for (const extra of droppedUtah) {
    if (utahCount(kept) >= minUtah) break;
    const swapAt = kept.findLastIndex((card) => card.opportunity.lane !== "state");
    if (swapAt < 0) break;
    kept = kept.map((card, index) => (index === swapAt ? extra : card));
  }
  return kept;
}

export function assembleRankedCards(
  retrieved: Opportunity[],
  rankCards: RankModelCard[],
  firedKeys: GoeoKey[] = [],
): OpportunityMapPayload {
  const byId = new Map<string, Opportunity>(retrieved.map((row) => [row.id, row]));
  const legal = dropUnknownRankIds(
    rankCards,
    retrieved.map((row) => row.id),
  );
  const assembled: RankedCard[] = legal.flatMap((card) => {
    const opportunity = byId.get(card.id);
    if (!opportunity) return [];
    return [
      {
        opportunity,
        fit: card.fit,
        why: card.why,
        concerns: card.concerns,
        nextStep: {
          label: card.nextStep.label,
          url: opportunity.url ?? card.nextStep.url,
        },
        similarAwardees: [],
      },
    ];
  });
  const floored = applyProbablyNotFloor(sortRankedCards(assembled));
  return {
    cards: enforceMapMix(
      floored.cards,
      retrieved,
      firedKeys,
      floored.floorTripped,
    ),
    floorTripped: floored.floorTripped,
    floorBanner: floored.floorBanner,
    retrievedIds: retrieved.map((row) => row.id),
    firedKeys,
  };
}
