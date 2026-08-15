import type { CompanyProfile } from "@/lib/types/company-profile";
import type { HistoryAttachment, RankedCard } from "@/lib/types/opportunity";

const USA_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/";
const ALN_CAP = 8;

type UsaRow = {
  "Recipient Name"?: string;
  "Award Amount"?: number;
  "Start Date"?: string;
  "Description"?: string;
  "Awarding Agency"?: string;
};

export async function loadUsaSpendingAwards(
  profile: CompanyProfile,
  cards: RankedCard[],
  fetchImpl: typeof fetch = fetch,
): Promise<HistoryAttachment[]> {
  const alns = [...new Set(cards.flatMap((card) => card.opportunity.aln))].slice(
    0,
    ALN_CAP,
  );
  if (alns.length === 0) return [];
  const preferState = (profile.hqState.value ?? "").toUpperCase();
  try {
    const batches = await Promise.all(
      alns.map((aln) => loadAwardsForAln(aln, preferState, fetchImpl)),
    );
    return batches.flat();
  } catch {
    return [];
  }
}

async function loadAwardsForAln(
  aln: string,
  preferState: string,
  fetchImpl: typeof fetch,
): Promise<HistoryAttachment[]> {
  const filters: Record<string, unknown> = {
    award_type_codes: ["02", "03", "04", "05"],
    program_numbers: [aln],
  };
  if (preferState) {
    filters.recipient_locations = [{ country: "USA", state: preferState }];
  }
  const rows = await spendingByAward(filters, fetchImpl, [aln]);
  if (rows.length > 0 || !preferState) return rows;
  delete filters.recipient_locations;
  return spendingByAward(filters, fetchImpl, [aln]);
}

async function spendingByAward(
  filters: Record<string, unknown>,
  fetchImpl: typeof fetch,
  aln: string[],
): Promise<HistoryAttachment[]> {
  let delayMs = 1000;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetchImpl(USA_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filters,
        fields: [
          "Award ID",
          "Recipient Name",
          "Award Amount",
          "Start Date",
          "Awarding Agency",
          "Description",
        ],
        limit: 5,
      }),
    });
    if (response.ok) {
      const payload = (await response.json()) as { results?: UsaRow[] };
      return (payload.results ?? []).flatMap((row) => {
        if (!row["Recipient Name"]) return [];
        const year = row["Start Date"]
          ? Number(row["Start Date"].slice(0, 4))
          : undefined;
        return [
          {
            source: "usaspending" as const,
            name: row["Recipient Name"] as string,
            amountUsd: row["Award Amount"],
            year: Number.isFinite(year) ? year : undefined,
            summary: row.Description,
            aln,
          },
        ];
      });
    }
    if (response.status !== 429 && response.status < 500) return [];
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs *= 2;
  }
  return [];
}
