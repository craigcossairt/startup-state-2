import { NextResponse } from "next/server";
import { runRetrieveThenRank } from "@/lib/pipeline";
import type { CompanyProfile } from "@/lib/types/company-profile";
import type { RetrieveChips } from "@/lib/types/opportunity";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    profile?: CompanyProfile;
    chips?: RetrieveChips;
  };
  if (!body.profile) {
    return NextResponse.json({ error: "profile is required" }, { status: 400 });
  }
  try {
    const payload = await runRetrieveThenRank(body.profile, body.chips ?? {});
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rank failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
