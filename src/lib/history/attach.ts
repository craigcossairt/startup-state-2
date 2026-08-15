import type { CompanyProfile } from "@/lib/types/company-profile";
import type { HistoryAttachment, RankedCard } from "@/lib/types/opportunity";

export type HistorySources = {
  sbirAwards?: HistoryAttachment[];
  usaAwards?: HistoryAttachment[];
};

const SBIR_SHAPED = /sbir|sttr/i;

export function isSbirShaped(card: RankedCard): boolean {
  const text = [card.opportunity.program, card.opportunity.opportunityNumber ?? ""].join(
    " ",
  );
  return SBIR_SHAPED.test(text);
}

export function attachHistory(
  cards: RankedCard[],
  _profile: CompanyProfile,
  sources: HistorySources = {},
): RankedCard[] {
  const sbir = sources.sbirAwards ?? [];
  const usa = sources.usaAwards ?? [];
  return cards.map((card) => {
    const federal = card.opportunity.lane === "federal";
    const pool =
      federal && isSbirShaped(card)
        ? sbir
        : federal && card.opportunity.aln.length > 0
          ? usa.filter((row) =>
              (row.aln ?? []).some((code) => card.opportunity.aln.includes(code)),
            )
          : [];
    return {
      ...card,
      similarAwardees: pool.slice(0, 3),
    };
  });
}
