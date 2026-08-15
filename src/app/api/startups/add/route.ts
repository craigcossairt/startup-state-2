import { NextResponse } from "next/server";
import { submitAddListing } from "@/lib/catalog/add-listing";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    website?: string;
    description?: string;
    sector?: string;
    stage?: string;
    region?: string;
    city?: string;
    fullAddress?: string;
    submitterEmail?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const result = submitAddListing({
    name: body.name ?? "",
    website: body.website ?? "",
    description: body.description,
    sector: body.sector ?? "",
    stage: body.stage ?? "",
    region: body.region ?? "",
    city: body.city,
    fullAddress: body.fullAddress,
    submitterEmail: body.submitterEmail ?? "",
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
