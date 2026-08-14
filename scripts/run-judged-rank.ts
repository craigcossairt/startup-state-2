import { writeFileSync } from "node:fs";
import { loadCompanyFixture } from "../src/lib/profile/load-fixture";
import { runRetrieveThenRank } from "../src/lib/pipeline";
import type { FixtureId } from "../src/lib/types/company-profile";

const fixture = process.argv[2] as FixtureId | undefined;
const out = process.argv[3];
if (!fixture || !out) {
  console.error("Usage: npx tsx scripts/run-judged-rank.ts <fixture-id> <out.json>");
  process.exit(1);
}

const payload = await runRetrieveThenRank(loadCompanyFixture(fixture));
writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(
  JSON.stringify(
    {
      fixture,
      cards: payload.cards.length,
      floorTripped: payload.floorTripped,
      ids: payload.cards.map((card) => card.opportunity.id),
      fits: payload.cards.map((card) => `${card.opportunity.lane}:${card.fit}`),
    },
    null,
    2,
  ),
);
