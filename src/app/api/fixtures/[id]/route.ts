import { NextResponse } from "next/server";
import { FIXTURE_IDS, loadCompanyFixture } from "@/lib/profile/load-fixture";
import type { FixtureId } from "@/lib/types/company-profile";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!FIXTURE_IDS.includes(id as FixtureId)) {
    return NextResponse.json({ error: "Unknown fixture" }, { status: 404 });
  }
  return NextResponse.json(loadCompanyFixture(id as FixtureId));
}
