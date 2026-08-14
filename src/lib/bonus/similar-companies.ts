import type { HistoryAttachment, RankedCard } from "@/lib/types/opportunity";

export function similarCompaniesFromCards(cards: RankedCard[]): HistoryAttachment[] {
  const seen = new Set<string>();
  const out: HistoryAttachment[] = [];
  for (const card of cards) {
    for (const row of card.similarAwardees) {
      const key = `${row.source}:${row.name}:${row.year ?? ""}`;
      if (!row.name || seen.has(key)) continue;
      seen.add(key);
      out.push(row);
    }
  }
  return out;
}
